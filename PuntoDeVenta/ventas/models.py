
# Create your models here.
from django.db import models
from django.utils.timezone import now

# Modelo de Producto
class Producto(models.Model):

    UNIDADES_CHOICES = [
        ('UN', 'Unidad'),
        ('KG', 'Kilogramo'),
    ]
    codigo = models.CharField(
        max_length=100, 
        unique=True, 
        null=True,   # Permite que en la base de datos sea NULL
        blank=True   # Permite que en formularios de Django se deje vacío
    )
    nombre = models.CharField(max_length=100)
    marca = models.CharField(max_length=100, blank=True, null=True)
    # Tu nuevo campo con el nombre que pediste
    unidad_venta = models.CharField(
    max_length=2, 
    choices=UNIDADES_CHOICES, 
    default='UN'
    )

    def __str__(self):
        # Manejamos el caso de que el código sea None
        cod = self.codigo if self.codigo else "SIN CÓDIGO"
        return f"{cod} - {self.nombre}"
    
    
    # Método para obtener el precio actual
    def precio_actual(self):
        precio = self.precios.order_by('-fecha_inicio').first()
        return precio.monto if precio else None

# Modelo para el historial de precios
class PrecioProducto(models.Model):
    producto = models.ForeignKey(Producto, on_delete=models.CASCADE, related_name='precios')
    monto = models.DecimalField(max_digits=10, decimal_places=2)
    fecha_inicio = models.DateTimeField(default=now)  # Cuándo empezó a aplicarse este precio

    class Meta:
        ordering = ['-fecha_inicio']  # Orden por fecha más reciente primero

    def __str__(self):
        return f"{self.producto.nombre} - {self.monto} desde {self.fecha_inicio}"


#########################################################################3

# Modelo de Cliente
class Cliente(models.Model):
    nombre = models.CharField(max_length=100)
    correo = models.EmailField()
    telefono = models.CharField(max_length=15, blank=True, null=True)

    def __str__(self):
        return self.nombre

# Modelo de Venta
class Venta(models.Model):
    cliente = models.ForeignKey(Cliente, on_delete=models.CASCADE)
    fecha = models.DateTimeField(auto_now_add=True)
    total = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f"Venta #{self.id} - {self.cliente.nombre}"

# Modelo de Detalle de Venta
class DetalleVenta(models.Model):
    venta = models.ForeignKey(Venta, on_delete=models.CASCADE, related_name='detalles')
    producto = models.ForeignKey(Producto, on_delete=models.CASCADE)
    cantidad = models.IntegerField()
    subtotal = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f"{self.cantidad} x {self.producto.nombre} (Venta #{self.venta.id})"