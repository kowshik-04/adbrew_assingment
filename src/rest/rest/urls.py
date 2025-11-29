# src/rest/rest/urls.py
from django.urls import path
from . import views
from .views_health import health

urlpatterns = [
    path("todos", views.todos, name="todos"),
    path("todos/<str:id>", views.todo_detail, name="todo_detail"),
    path("healthz", views.healthz, name="healthz"),
    path("health", health, name="health"),
]
