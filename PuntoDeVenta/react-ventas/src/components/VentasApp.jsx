import React, { useState } from "react";
import "./VentasApp.css"; // Agregar un archivo CSS específico para este componente.

const VentasApp = () => {
  const [codigoProducto, setCodigoProducto] = useState("");
  const [cantidad, setCantidad] = useState(1);
  const [productos, setProductos] = useState([]); // Lista de productos agregados.
  const [totalVenta, setTotalVenta] = useState(0.0);

  // Función para manejar el cambio de cantidad directamente en la tabla
  const handleCantidadChange = (index, newCantidad) => {
    // Quitar ceros iniciales pero permitir '0.000...' y números negativos
    let cantidadLimpia = newCantidad.replace(/^(-?)0+(?=\d)/, '$1');
    
    // Validar y convertir a número
    const cantidadValida = parseFloat(cantidadLimpia);
    
    // Si el resultado es NaN, establecemos a 0; de lo contrario, usamos el valor convertido
    const cantidadFinal = isNaN(cantidadValida) ? 0 : cantidadValida;
  
    const newProductos = [...productos];
    newProductos[index].cantidad = cantidadFinal;
    newProductos[index].subtotal = newProductos[index].cantidad * newProductos[index].precio;
  
    // Actualizamos el producto en el estado
    setProductos(newProductos);
  
    // Recalcular el total de la venta. Aquí asumimos que subtotal puede ser negativo si cantidad lo es.
    const nuevoTotal = newProductos.reduce(
      (acc, producto) => acc + producto.subtotal,
      0
    );
    setTotalVenta(nuevoTotal);
  };

  // Función para agregar un producto cuando se ingresa el código
  const handleSubmit = (event) => {
    event.preventDefault();

    const csrfToken = window.csrfToken; // Usar la variable global configurada
    if (!csrfToken) {
      console.error("CSRF token not found!");
      //return;
    }

    fetch("http://localhost:8000", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": csrfToken,
      },
      body: JSON.stringify({ codigo_producto: codigoProducto, cantidad: parseFloat(cantidad.toFixed(3)) }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.error) {
          console.error("Error en respuesta del servidor:", data.error);
          alert(data.error);
        } else {
          // Convertir valores numéricos y agregar el producto
          const productoConValoresNumericos = {
            ...data,
            codigo_producto: codigoProducto,
            cantidad: parseFloat(cantidad.toFixed(3)), // Convertir cantidad a float
            precio: parseFloat(data.precio),
            subtotal: parseFloat(data.precio) * parseFloat(cantidad.toFixed(3)), // Calcular subtotal
          };

          // Agregar el nuevo producto a la lista de productos y actualizar el total
          setProductos((prevProductos) => {
            const nuevosProductos = [...prevProductos, productoConValoresNumericos];
            const nuevoTotal = nuevosProductos.reduce(
              (acc, producto) => acc + producto.subtotal,
              0
            );
            setTotalVenta(nuevoTotal);
            return nuevosProductos;
          });

          // Limpiar los campos de entrada
          setCodigoProducto("");
          setCantidad(1);
        }
      })
      .catch((error) => console.error("Error en la solicitud:", error));
  };

  return (
    <div className="contenedor-principal">
      <form onSubmit={handleSubmit}>
        <label>
          Código del Producto:
          <input
            type="text"
            value={codigoProducto}
            onChange={(e) => setCodigoProducto(e.target.value)}
            required
          />
        </label>
        <br />
        <label>
          Cantidad:
          <input
            type="number"
            //step="0.005"
            value={cantidad}
            onChange={(e) => setCantidad(parseFloat(e.target.value) )}
            
            required
          />
        </label>
        <br />
        <button type="submit">Agregar</button>
      </form>

      <section className="tabla-containersection">
        <table className="productos-table">
          <thead>
            <tr>
              <th>CODIGO</th>
              <th className="cantidad-col">CANTIDAD</th>
              <th>PRODUCTO</th>
              <th>PRECIO</th>
              <th>SUBTOTAL</th>
            </tr>
          </thead>
          <tbody>
            {productos.map((producto, index) => (
              <tr key={index}>
                <td>{producto.codigo_producto}</td>
                <td className="cantidad-col">
                  <input
                    type="number"
                    value={producto.cantidad !== null ? producto.cantidad.toString().replace(/^(-?)0+(?=\d)/, '$1') : '0'}
                    onChange={(e) => handleCantidadChange(index, e.target.value)}
                
                  />
                </td>
                <td>{producto.nombre_producto}</td>
                <td>${producto.precio.toFixed(2)}</td>
                <td>${producto.subtotal.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <div>
        <h3>TOTAL VENTA: ${totalVenta.toFixed(2)}</h3>
      </div>
    </div>
  );
};

export default VentasApp;
