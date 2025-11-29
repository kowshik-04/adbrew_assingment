# src/rest/rest/urls.py
from django.urls import path
from . import views

urlpatterns = [
    path("todos", views.todos, name="todos"),
    path("todos/<str:id>", views.todo_detail, name="todo_detail"),
]
