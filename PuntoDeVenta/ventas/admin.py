

# Register your models here.
from django.contrib import admin
from .models import Producto, PrecioProducto, Cliente, Venta, DetalleVenta

admin.site.register(Producto)
admin.site.register(PrecioProducto)
admin.site.register(Cliente)
admin.site.register(Venta)
admin.site.register(DetalleVenta)
