# src/rest/rest/views_health.py
from django.http import JsonResponse
from django.views.decorators.http import require_GET
from django.conf import settings

@require_GET
def health(request):
    # Minimal health: ensure app responds. Optionally probe DB here.
    return JsonResponse({"status": settings.HEALTH_OK_MESSAGE})
