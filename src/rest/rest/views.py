# src/rest/rest/views.py
import os
import json
from datetime import datetime
from django.http import JsonResponse, HttpResponseNotAllowed, HttpResponseBadRequest, HttpResponse
from django.views.decorators.csrf import csrf_exempt

import pymongo
from bson.objectid import ObjectId
from pymongo.errors import ServerSelectionTimeoutError

# Mongo connection (module-level client reused across requests)
MONGO_HOST = os.environ.get("MONGO_HOST", "mongo")
MONGO_PORT = int(os.environ.get("MONGO_PORT", 27017))
MONGO_DBNAME = os.environ.get("MONGO_DBNAME", "adb_test_db")  # DB name - change if you use a different DB
MONGO_COLLECTION = os.environ.get("MONGO_COLLECTION", "todos")

# Create a client once. Use a short timeout so errors surface quickly.
_client = None
def get_client():
    global _client
    if _client is None:
        _client = pymongo.MongoClient(host=MONGO_HOST, port=MONGO_PORT, serverSelectionTimeoutMS=2000)
    return _client

def get_collection():
    client = get_client()
    db = client[MONGO_DBNAME]
    return db[MONGO_COLLECTION]

def _doc_to_json(doc):
    if doc is None:
        return None
    out = dict(doc)
    # Convert ObjectId to string
    _id = out.get("_id")
    try:
        out["_id"] = str(_id)
    except Exception:
        out["_id"] = _id
    # ensure created_at is string
    ca = out.get("created_at")
    if isinstance(ca, datetime):
        out["created_at"] = ca.isoformat()
    return out

@csrf_exempt
def todos(request):
    """
    GET /todos -> list todos
    POST /todos -> create todo { description: "..." }
    """
    col = get_collection()
    try:
        # trigger server selection to raise early if mongo unavailable
        get_client().server_info()
    except ServerSelectionTimeoutError:
        return JsonResponse({"error": "mongo unavailable"}, status=503)

    if request.method == "GET":
        # fetch all todos (return as list)
        cursor = col.find().sort("created_at", pymongo.DESCENDING)
        docs = [_doc_to_json(d) for d in cursor]
        return JsonResponse(docs, safe=False, status=200)

    if request.method == "POST":
        try:
            payload = json.loads(request.body.decode("utf-8") or "{}")
        except Exception:
            return HttpResponseBadRequest(json.dumps({"error": "invalid json"}), content_type="application/json")

        description = (payload.get("description") or "").strip()
        if not description:
            return JsonResponse({"error": "description required"}, status=400)

        doc = {
            "description": description,
            "created_at": datetime.utcnow(),
            "completed": False
        }
        r = col.insert_one(doc)
        # fetch created doc
        created = col.find_one({"_id": r.inserted_id})
        return JsonResponse(_doc_to_json(created), status=201)

    return HttpResponseNotAllowed(["GET", "POST"])


@csrf_exempt
def todo_detail(request, id):
    """
    PATCH /todos/<id> -> partial update (description, completed)
    DELETE /todos/<id> -> delete
    """
    col = get_collection()
    try:
        get_client().server_info()
    except ServerSelectionTimeoutError:
        return JsonResponse({"error": "mongo unavailable"}, status=503)

    # helper: match either ObjectId (24 hex) or raw string
    def _build_id_query(key):
        # If id looks like 24-hex-objectid, use ObjectId; else try raw string match
        try:
            if len(key) == 24:
                return {"_id": ObjectId(key)}
        except Exception:
            pass
        return {"_id": key}

    if request.method == "PATCH" or request.method == "PUT":
        try:
            payload = json.loads(request.body.decode("utf-8") or "{}")
        except Exception:
            return HttpResponseBadRequest(json.dumps({"error": "invalid json"}), content_type="application/json")

        updates = {}
        if "description" in payload:
            desc = (payload.get("description") or "").strip()
            if not desc:
                return JsonResponse({"error": "description cannot be empty"}, status=400)
            updates["description"] = desc
        if "completed" in payload:
            updates["completed"] = bool(payload.get("completed"))

        if not updates:
            return JsonResponse({"error": "no updatable fields provided"}, status=400)

        query = _build_id_query(id)
        res = col.update_one(query, {"$set": updates})
        if res.matched_count == 0:
            return JsonResponse({"error": "todo not found"}, status=404)

        updated = col.find_one(query)
        return JsonResponse(_doc_to_json(updated), status=200)

    if request.method == "DELETE":
        query = _build_id_query(id)
        res = col.delete_one(query)
        if res.deleted_count == 0:
            return JsonResponse({"error": "todo not found"}, status=404)
        return JsonResponse({"status": "deleted"}, status=200)

    return HttpResponseNotAllowed(["PATCH", "DELETE", "PUT"])
