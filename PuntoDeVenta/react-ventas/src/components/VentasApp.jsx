import React, { useState } from "react";
import "./VentasApp.css"; // Agregar un archivo CSS específico para este componente.

const VentasApp = () => {
  const [codigoProducto, setCodigoProducto] = useState("");
  const [cantidad, setCantidad] = useState("1"); // Ahora es string
  const [productos, setProductos] = useState([]); // Lista de productos agregados.
  const [totalVenta, setTotalVenta] = useState(0.0);

  // Función para manejar cambios en la cantidad
  const handleCantidadChange = (index, newCantidad) => {
    // Validar con expresión regular (permite negativos y decimales)
    if (/^-?\d*\.?\d*$/.test(newCantidad) || newCantidad === "") {
      const newProductos = [...productos];
      newProductos[index].cantidad = newCantidad;

      // Recalcular subtotal si el valor no es vacío
      const cantidadNumerica = parseFloat(newCantidad) || 0;
      newProductos[index].subtotal = cantidadNumerica * newProductos[index].precio;

      // Actualizar estado
      setProductos(newProductos);

      // Recalcular total
      const nuevoTotal = newProductos.reduce(
        (acc, producto) => acc + producto.subtotal,
        0
      );
      setTotalVenta(nuevoTotal);
    }
  };

  // Función para agregar un producto cuando se ingresa el código
  const handleSubmit = (event) => {
    event.preventDefault();

    fetch("http://localhost:8000", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        codigo_producto: codigoProducto,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.error) {
          alert(data.error);
        } else {
          const nuevoProducto = {
            ...data,
            codigo_producto: codigoProducto,
            cantidad, // Mantener como string
            precio: parseFloat(data.precio),
            subtotal: parseFloat(data.precio) * (parseFloat(cantidad) || 0),
          };

          setProductos((prevProductos) => {
            const nuevosProductos = [...prevProductos, nuevoProducto];
            const nuevoTotal = nuevosProductos.reduce(
              (acc, producto) => acc + producto.subtotal,
              0
            );
            setTotalVenta(nuevoTotal);
            return nuevosProductos;
          });

          // Limpiar los campos de entrada
          setCodigoProducto("");
          setCantidad("1"); // Mantener como string
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
            type="text"
            value={cantidad}
            onChange={(e) => {
              const value = e.target.value;
              if (/^-?\d*\.?\d*$/.test(value) || value === "") {
                setCantidad(value);
              }
            }}
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
                    type="text"
                    value={producto.cantidad}
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
