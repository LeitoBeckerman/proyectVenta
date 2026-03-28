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
        precio_producto = PrecioProducto.objects.filter(producto=producto).order_by('-fecha_inicio').first()
        if not precio_producto:
            return JsonResponse({'error': 'Precio no disponible', 'codigo_producto': codigo_producto})

        return JsonResponse({
            'nombre_producto': producto.nombre,
            'precio': precio_producto.monto,
        })
    except Producto.DoesNotExist:
        return JsonResponse({'error': 'Producto no encontrado', 'codigo_producto': None})

def _buscar_por_nombre(nombre_producto):
    productos = Producto.objects.filter(nombre__icontains=nombre_producto)
    results = []
    for producto in productos:
        precio_obj = PrecioProducto.objects.filter(producto=producto).order_by('-fecha_inicio').first()
        if not precio_obj:
            continue

        results.append({
            'id': producto.id,
            'nombre_producto': producto.nombre,
            'codigo_producto': producto.codigo,
            'precio': precio_obj.monto,
            'marca': producto.marca,
            'unidad_venta': producto.unidad_venta
        })
    return JsonResponse({'productos': results})


# Endpoint para editar un producto existente
@csrf_exempt  # Desactiva la protección CSRF para permitir PUT desde React
def editar_producto_view(request):
    """
    Maneja solicitudes PUT para editar un producto existente.
    Actualiza los datos del producto y su precio.
    """
    if request.method == 'PUT':
        try:
            data = json.loads(request.body)
            producto_id = data.get('id')

            if not producto_id:
                return JsonResponse({'error': 'Se requiere el ID del producto'}, status=400)

            # Buscar el producto
            try:
                producto = Producto.objects.get(id=producto_id)
            except Producto.DoesNotExist:
                return JsonResponse({'error': 'Producto no encontrado'}, status=404)

            # Actualizar los datos del producto
            if 'codigo_producto' in data and data['codigo_producto']:
                producto.codigo = data['codigo_producto']
            if 'nombre_producto' in data and data['nombre_producto']:
                producto.nombre = data['nombre_producto']
            if 'marca' in data:
                producto.marca = data['marca']
            if 'unidad_venta' in data:
                producto.unidad_venta = data['unidad_venta']

            producto.save()

            # Actualizar el precio si fue proporcionado
            if 'precio' in data:
                nuevo_precio = data['precio']
                # Crear un nuevo registro de precio (mantiene el historial)
                PrecioProducto.objects.create(
                    producto=producto,
                    monto=nuevo_precio
                )

            return JsonResponse({
                'error': None,
                'mensaje': 'Producto actualizado correctamente',
                'producto': {
                    'id': producto.id,
                    'codigo_producto': producto.codigo,
                    'nombre_producto': producto.nombre,
                    'marca': producto.marca,
                    'unidad_venta': producto.unidad_venta,
                }
            })

        except json.JSONDecodeError:
            return JsonResponse({'error': 'Datos JSON no válidos'}, status=400)
        except Exception as e:
            print(f"Error al editar producto: {str(e)}")
            return JsonResponse({'error': f'Error interno del servidor: {str(e)}'}, status=500)
    
    return JsonResponse({'error': 'Método no permitido. Use PUT'}, status=405)


# Endpoint para crear un nuevo producto
@csrf_exempt  # Desactiva la protección CSRF para permitir POST desde React
def crear_producto_view(request):
    """
    Maneja solicitudes POST para crear un nuevo producto.
    Crea el producto y su precio inicial.
    """
    if request.method == 'POST':
        try:
            data = json.loads(request.body)

            # Validar campos obligatorios
            codigo = data.get('codigo_producto', '').strip()
            nombre = data.get('nombre_producto', '').strip()
            marca = data.get('marca', '').strip()
            unidad_venta = data.get('unidad_venta', 'UN')
            precio = data.get('precio', '')

            if not codigo:
                return JsonResponse({'error': 'El código del producto es obligatorio'}, status=400)
            if not nombre:
                return JsonResponse({'error': 'El nombre del producto es obligatorio'}, status=400)
            if not marca:
                return JsonResponse({'error': 'La marca es obligatoria'}, status=400)
            if not precio:
                return JsonResponse({'error': 'El precio es obligatorio'}, status=400)

            # Verificar que el código no exista ya
            if Producto.objects.filter(codigo=codigo).exists():
                return JsonResponse({'error': f'El código {codigo} ya existe en la base de datos'}, status=400)

            # Crear el nuevo producto
            nuevo_producto = Producto.objects.create(
                codigo=codigo,
                nombre=nombre,
                marca=marca,
                unidad_venta=unidad_venta
            )

            # Crear el registro de precio
            PrecioProducto.objects.create(
                producto=nuevo_producto,
                monto=float(precio)
            )

            return JsonResponse({
                'error': None,
                'mensaje': 'Producto creado correctamente',
                'producto': {
                    'id': nuevo_producto.id,
                    'codigo_producto': nuevo_producto.codigo,
                    'nombre_producto': nuevo_producto.nombre,
                    'marca': nuevo_producto.marca,
                    'unidad_venta': nuevo_producto.unidad_venta,
                    'precio': float(precio),
                }
            })

        except json.JSONDecodeError:
            return JsonResponse({'error': 'Datos JSON no válidos'}, status=400)
        except ValueError:
            return JsonResponse({'error': 'El precio debe ser un número válido'}, status=400)
        except Exception as e:
            print(f"Error al crear producto: {str(e)}")
            return JsonResponse({'error': f'Error interno del servidor: {str(e)}'}, status=500)
    
    return JsonResponse({'error': 'Método no permitido. Use POST'}, status=405)