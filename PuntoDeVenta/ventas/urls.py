from django.urls import path
from . import views # Asegúrate de que esta vista exista en views.py

urlpatterns = [
    path('', views.ventas_view, name='ventas'),  # Define esta URL correctamente
    path('editar-producto', views.editar_producto_view, name='editar_producto'),  # Endpoint para editar
    path('crear-producto', views.crear_producto_view, name='crear_producto'),  # Endpoint para crear
]
   