import React, { useState } from "react";
import "./VentasApp.css"; // Agregar un archivo CSS específico para este componente.



const VentasApp = () => {
  const [codigoProducto, setCodigoProducto] = useState("");
  const [cantidad, setCantidad] = useState(1);
  const [productos, setProductos] = useState([]); // Lista de productos agregados.
  const [totalVenta, setTotalVenta] = useState(0.0);
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
      body: JSON.stringify({ codigo_producto: codigoProducto, cantidad }),
    })
      .then((response) => {
        console.log("Response status:", response.status);
        return response.json();
      })
      .then((data) => {
        if (data.error) {
          console.error("Error en respuesta del servidor:", data.error);
          alert(data.error);
        } else {
          console.log("Producto agregado con éxito:", data);
          
          // Convertir valores numéricos
          const productoConValoresNumericos = {
            ...data,
            codigo_producto: codigoProducto,
            cantidad: parseFloat(cantidad), // Convertir cantidad a float
            precio: parseFloat(data.precio),
            subtotal: parseFloat(data.subtotal),
          };

        // Agregar el nuevo producto a la lista de productos
         // Agregar el nuevo producto a la lista de productos y actualizar el total.
         setProductos((prevProductos) => {
          const nuevosProductos = [...prevProductos, productoConValoresNumericos];
          // Calcular el nuevo total acumulado.
          const nuevoTotal = nuevosProductos.reduce(
            (acc, producto) => acc + producto.subtotal,
            0
          );
          setTotalVenta(nuevoTotal); // Actualizar el total de la venta.
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
            value={cantidad}
            onChange={(e) => setCantidad(e.target.value)}
            min="1"
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
                <td className="cantidad-col">{producto.cantidad.toFixed(2)}</td>
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
