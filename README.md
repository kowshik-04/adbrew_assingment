# 🚀 Adbrew Todo Application — Production Release v1.1

**Author:** Kowshik Mente  
**Version:** `v1.1 (Production-Ready Upgrade)`  
**Original Assignment Version:** `v1.0`

This repository contains a **full-stack Todo application** built for the **Adbrew Backend SDE Internship Assignment**.  
Version **v1.1** introduces a fully **production-ready architecture**, including Dockerized builds, Gunicorn, Nginx, improved security, environment-based config, and a redesigned frontend UI.

---

# ✨ What’s New in v1.1

| Area | Improvements |
|------|-------------|
| **Backend** | Gunicorn, better settings, environment-based config, health-check route |
| **Frontend** | Fully redesigned UI/UX, animations, search, pagination, improved accessibility |
| **Docker** | Multi-stage builds, separate `api` & `frontend` images, production compose file |
| **DevOps** | `.env.prod` support, non-root container user, static asset serving via Nginx |
| **Security** | No secrets in repo, CORS tightened (configurable), safe defaults |

---

# 🧠 Tech Stack

### **Backend**
- Python 3.10  
- Django  
- Gunicorn  
- PyMongo  
- WhiteNoise  
- Custom REST API views  

### **Frontend**
- React  
- Custom modern UI with animations  
- Toast notifications  
- Search + pagination  

### **Database**
- MongoDB  

### **Infra**
- Docker  
- Docker Compose  
- Nginx  
- Environment-based config  

---

# 📁 Project Structure

```bash
adb_test/
├── docker/
│   ├── Dockerfile.api
│   ├── Dockerfile.app
│   ├── docker-compose.prod.yml
│   ├── nginx.conf
│   └── entrypoint-api.sh
├── src/
│   ├── rest/
│   ├── app/
│   ├── db/
│   └── tmp/
├── docker-compose.yml
└── README.md
```

---

# 🧩 Features

### **Backend**
- Create, List, Update, Delete Todos  
- MongoDB persistence  
- Gunicorn server  
- `/healthz` endpoint  
- Environment-driven configuration  
- JSON responses  

---

### **Frontend**
- Add Todo  
- Edit Todo  
- Delete Todo  
- Toggle completed  
- Search, filter  
- Pagination  
- High-contrast UI  
- Smooth animations  
- Accessible keyboard interactions  

---

# 🔥 API Endpoints

## Base URL
```
http://localhost:8000
```

### List Todos
```
GET /todos
```

### Create Todo
```
POST /todos
{
  "description": "New task"
}
```

### Update Todo
```
PATCH /todos/<id>
```

### Delete Todo
```
DELETE /todos/<id>
```

### Health Check
```
GET /healthz
```

---

# 🐳 Running the App

## 1️⃣ Development Mode

### Backend
```bash
cd src/rest
pip install -r requirements.txt
python manage.py runserver
```

### Frontend
```bash
cd src/app
yarn install
yarn start
```

### Dev Docker
```bash
docker compose up --build
```

---

# 2️⃣ Production Mode — (v1.1)

### Step 1 — Build images
```bash
docker compose -f docker/docker-compose.prod.yml build --no-cache
```

### Step 2 — Run stack
```bash
docker compose -f docker/docker-compose.prod.yml up -d
```

### Services

| Service | URL |
|--------|-----|
| Frontend | http://localhost |
| API | http://localhost:8000 |
| Health | http://localhost:8000/healthz |
| Mongo | localhost:27017 |

---

# ⚙️ Environment Variables

Create `.env.prod` (never commit it):

```env
DEBUG=False
SECRET_KEY=your_generated_secret_here
ALLOWED_HOSTS=localhost,127.0.0.1

MONGO_HOST=mongo
MONGO_PORT=27017
MONGO_DBNAME=adb_test_db
MONGO_COLLECTION=todos

DJANGO_SETTINGS_MODULE=rest.settings

REACT_APP_API_BASE=/api
```

⚠️ **Important:**  
`.env.prod` is in `.gitignore` → not committed.

---

# 🏗 Architecture Overview

```
          ┌───────────┐
          │  Frontend │  (Nginx serving React build)
          └──────┬────┘
                 │ /api
                 ▼
         ┌───────────────┐
         │ Django API     │ (Gunicorn)
         └───────┬────────┘
                 │
                 ▼
         ┌───────────────┐
         │   MongoDB     │
         └───────────────┘
```

---

# 🔒 Security Improvements (v1.1)
- No secrets in repo  
- Gunicorn instead of Django dev server  
- Non-root container user  
- `.env.prod` required  
- Strict ALLOWED_HOSTS  
- CORS configurable  
- Static assets served by Nginx  

---

# 🧪 Optional Future Enhancements
- CI/CD pipeline  
- Unit tests  
- DRF-based version  
- Logging & monitoring stack  
- Deploy to AWS / Render / Railway  

---

# 📝 Final Notes

This repo now contains two logical versions:

| Version | Description |
|---------|-------------|
| **v1.0** | Raw assignment submission |
| **v1.1** | Production-ready, optimized version |

If Adbrew allows post-deadline improvements, I will update this branch and notify via email.

---

# 👤 Author
**Kowshik Mente**  
GitHub: https://github.com/kowshik-04
