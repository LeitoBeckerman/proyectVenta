import React, { useState } from "react";
import "./VentasApp.css"; // Agregar un archivo CSS específico para este componente.
import { agregarProducto } from "../utils/productosService.js"; // Importamos desde el nuevo archivo


const VentasApp = () => {
  const [codigoProducto, setCodigoProducto] = useState("");
  const [cantidad, setCantidad] = useState("1"); // Ahora es string
  const [productos, setProductos] = useState([]); // Lista de productos agregados.
  const [totalVenta, setTotalVenta] = useState(0.0);
  const [filaSeleccionada, setFilaSeleccionada] = useState(null);


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
    // Función para manejar el envío del formulario
    const handleSubmit = (event) => {
      event.preventDefault();
      agregarProducto(codigoProducto, cantidad, setProductos, setTotalVenta, setCodigoProducto, setCantidad);
    };

    const handleEliminarProducto = () => {
      if (filaSeleccionada !== null) {
        setProductos((prevProductos) => {
          const nuevosProductos = prevProductos.filter((_, i) => i !== filaSeleccionada);
    
          // Recalcular total
          const nuevoTotal = nuevosProductos.reduce(
            (acc, producto) => acc + producto.subtotal,
            0
          );
          setTotalVenta(nuevoTotal);
          return nuevosProductos;
        });
    
        // Limpiar la selección
        setFilaSeleccionada(null);
      }
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

      <div className="boton-container">
        {/* Botón para eliminar el producto seleccionado */}
        <button 
          className="boton-eliminar"
          type="button"  
          onClick={handleEliminarProducto} 
          disabled={filaSeleccionada === null}
        >
          Eliminar
        </button>
      </div>


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
              <tr key={index}
        
              className={filaSeleccionada === index ? "seleccionado" : ""}
              onClick={() => setFilaSeleccionada(index)} // Seleccionar fila al hacer clic
              >
                <td>{producto.codigo_producto}</td>
                <td className="cantidad-col">
                  <input 
                    type="text"
                    value={producto.cantidad}
                    onChange={(e) => handleCantidadChange(index, e.target.value)}
                    className="input-cantidad"
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
