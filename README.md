# Adbrew Assignment - Full-Stack Todo Application

A full-stack Todo application built as part of the **Adbrew Backend SDE Intern assignment**.  
This project includes a Django backend, React frontend, MongoDB database, and Dockerized infrastructure.

---

## Features

### Backend (Django + MongoDB)
- Create todos  
- List todos  
- Update todos  
- Delete todos  
- MongoDB persistence via PyMongo  
- Clean, modular structure  

### Frontend (React)
- Add todo  
- Edit todo  
- Delete todo  
- View todos  
- Smooth and responsive UI  
- High-contrast, user-friendly layout  

### Infrastructure
- Docker Compose setup  
- Separate containers for API, frontend, database  
- Hot reload support  
- One-command startup  

---

## Folder Structure

```
adb_test/
 ├── src/
 │   ├── rest/      # Django backend
 │   ├── app/       # React frontend
 │   ├── db/        # MongoDB persistent data
 │   └── tmp/       # Temp directory
 ├── docker-compose.yml
 ├── Dockerfile
 └── README.md
```

---

## Tech Stack

**Backend:** Python, Django, PyMongo  
**Frontend:** React, Axios, JavaScript  
**Database:** MongoDB  
**DevOps:** Docker, Docker Compose  

---

## API Endpoints

Base URL:
```
http://localhost:8000/
```

### Get all todos
```
GET /todos
```

### Create a todo
```
POST /todos
Content-Type: application/json

{
  "description": "My task"
}
```

### Update a todo
```
PUT /todos/<id>
Content-Type: application/json

{
  "description": "Updated task"
}
```

### Delete a todo
```
DELETE /todos/<id>
```

---

## Running with Docker

### 1. Set the codebase path
```bash
export ADBREW_CODEBASE_PATH="$(pwd)/src"
```

### 2. Build Docker images
```bash
docker-compose build --no-cache
```

### 3. Start all services
```bash
docker-compose up -d
```

### 4. Access URLs

| Service   | URL                    |
|-----------|------------------------|
| Frontend  | http://localhost:3000  |
| Backend   | http://localhost:8000  |
| MongoDB   | localhost:27017        |

---

## Running Locally (Without Docker)

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

---

## Architecture

```
React Frontend
        ↓
Django Backend API
        ↓
MongoDB Database
```

---

## Design Choices

### Backend
- Simple architecture  
- Direct MongoDB access (PyMongo)  
- Lightweight and easy to extend  
- Clear separation of concerns  

### Frontend
- React Hooks  
- Single clean component  
- Smooth user experience  

### Docker
- Three independent services  
- Bind mounts for hot reload  
- Official MongoDB image  

---

## Optional Production Improvements

### Backend
- Django REST Framework  
- Add unit tests  
- Add pagination & validation  
- Deploy using Gunicorn + Nginx  

### Frontend
- Component modularization  
- Add Redux / Zustand  
- Add form validation  
- Toast messages for UX  

### DevOps
- Multi-stage Docker builds  
- CI/CD pipeline  
- Environment-specific configs  

---

## Conclusion

This project includes:

- Fully working CRUD API  
- MongoDB data persistence  
- Clean React UI  
- Dockerized backend, frontend, and database  
- High-quality, extensible architecture  

The implementation fulfills all core requirements of the Adbrew assignment.

