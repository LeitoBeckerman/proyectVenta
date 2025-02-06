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
            codigo_producto = data.get('codigo_producto')
             # Validar que el código de producto no esté vacío
            if not codigo_producto:
                return JsonResponse({'error': 'El código de producto es requerido', 'codigo_producto': None}, status=400)

            #buscar el producto
            producto = Producto.objects.get(codigo=codigo_producto)
            #buscar el precio del producto
            precio_producto = PrecioProducto.objects.get(producto=producto)
#precioProducto tiene la tabla precioProducto, pero el nombre de precio es monto

            return JsonResponse({
                'nombre_producto': producto.nombre,
                'precio': precio_producto.monto,
            })
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Datos JSON no válidos'}, status=400)
        except Producto.DoesNotExist:
            return JsonResponse({'error': 'Producto no encontrado', 'codigo_producto': None})
        except PrecioProducto.DoesNotExist:
            return JsonResponse({'error': 'Precio no disponible', 'codigo_producto': codigo_producto})
    else:
        return render(request, 'ventas.html')  # Renderiza ventas.html cuando es GET
