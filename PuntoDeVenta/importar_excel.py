import os
import django
import pandas as pd
import numpy as np

# Configuración de Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'PuntoDeVenta.settings')
django.setup()

from ventas.models import Producto, PrecioProducto

def cargar_datos(archivo_excel):
    print(f"Iniciando carga desde: {archivo_excel}")
    # Leemos el excel
    df = pd.read_excel(archivo_excel)

    # Limpieza: quitar espacios en los nombres de las columnas
    df.columns = df.columns.str.strip()

    productos_creados = 0
    precios_creados = 0

    for index, fila in df.iterrows():
        # VALIDACIÓN: Si el precio o la marca están vacíos, es una sección o fila vacía
        if pd.isna(fila['Precio']) or pd.isna(fila['Marca']):
            # print(f"Saltando fila {index + 2}: Posible encabezado de sección.")
            continue

        try:
            nombre_art = str(fila['Nombre Artículo']).strip()
            marca_art = str(fila['Marca']).strip()
            unidad_raw = str(fila['Unidad de Venta']).lower()
            precio_val = float(fila['Precio'])

            # Determinar unidad
            u_venta = 'KG' if 'kg' in unidad_raw else 'UN'

            # 1. Crear o buscar el Producto
            # (No usamos el código porque el Excel no lo tiene)
            producto, creado = Producto.objects.get_or_create(
                nombre=nombre_art,
                marca=marca_art,
                defaults={'unidad_venta': u_venta}
            )

            if creado:
                productos_creados += 1

            # 2. Crear el Precio vinculado
            PrecioProducto.objects.create(
                producto=producto,
                monto=precio_val
            )
            precios_creados += 1

            if (index + 1) % 50 == 0:
                print(f"Procesados {index + 1} registros...")

        except Exception as e:
            print(f"Error en fila {index + 2}: {e}")

    print(f"\n--- CARGA FINALIZADA ---")
    print(f"Total filas procesadas: {len(df)}")
    print(f"Productos nuevos creados: {productos_creados}")
    print(f"Precios registrados: {precios_creados}")

if __name__ == "__main__":
    # Asegúrate de que el nombre coincida con tu archivo real
    cargar_datos('ListaPrecios.xlsx')