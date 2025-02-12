from django.shortcuts import render
from django.http import JsonResponse
import json
from .models import Producto, PrecioProducto

from django.views.decorators.csrf import csrf_exempt
@csrf_exempt  # Desactiva la protección CSRF solo para el método POST
def ventas_view(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body) 
            print("Datos recibidos:", data) 
            codigo_producto = data.get('codigo_producto')
            nombre_producto = data.get('nombre_producto', '')

            if codigo_producto:
                return _buscar_por_codigo(codigo_producto)
            elif nombre_producto:
                return _buscar_por_nombre(nombre_producto)
            else:
                return JsonResponse({'error': 'Se requiere un código o nombre de producto'}, status=400)
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Datos JSON no válidos'}, status=400)
        except Exception as e:
            # Captura cualquier otra excepción y proporciona un mensaje genérico para seguridad
            return JsonResponse({'error': 'Error interno del servidor'}, status=500)

    return render(request, 'ventas.html')

def _buscar_por_codigo(codigo_producto):
    try:
        producto = Producto.objects.get(codigo=codigo_producto)
        precio_producto = PrecioProducto.objects.get(producto=producto)
        return JsonResponse({
            'nombre_producto': producto.nombre,
            'precio': precio_producto.monto,
        })
    except Producto.DoesNotExist:
        return JsonResponse({'error': 'Producto no encontrado', 'codigo_producto': None})
    except PrecioProducto.DoesNotExist:
        return JsonResponse({'error': 'Precio no disponible', 'codigo_producto': codigo_producto})

def _buscar_por_nombre(nombre_producto):
    productos = Producto.objects.filter(nombre__icontains=nombre_producto)
    results = []
    for producto in productos:
        try:
            precio = PrecioProducto.objects.get(producto=producto).monto
            results.append({
                'nombre_producto': producto.nombre,
                'codigo_producto': producto.codigo,
                'precio': precio
            })
        except PrecioProducto.DoesNotExist:
            continue  
    return JsonResponse({'productos': results})