import React, { useState, useEffect,useRef} from "react";
import "./VentasApp.css";
import { agregarProducto } from "../utils/productosService.js";
import { Html5QrcodeScanner, Html5QrcodeSupportedFormats } from "html5-qrcode";

const VentasApp = () => {
  const [codigoProducto, setCodigoProducto] = useState("");
  const [cantidad, setCantidad] = useState("1");
  const [productos, setProductos] = useState([]);
  const [totalVenta, setTotalVenta] = useState(0.0);
  const [filaSeleccionada, setFilaSeleccionada] = useState(null);
  const inputRef = useRef(null); // Referencia para el input


  useEffect(() => {
    // Enfoca el input cuando el componente se monta
    inputRef.current.focus();
  }, []); // El array vacío [] asegura que este efecto se ejecute solo una vez al montarse el componente



  // Función para manejar el escaneo de código de barras
  const iniciarEscaneo = () => {
    const scanner = new Html5QrcodeScanner(
      "reader",
      {
        qrbox: { width: 300, height: 300 },
        fps: 10,
        formatsToSupport: [Html5QrcodeSupportedFormats.EAN_13], // Solo escanear EAN-13
      },
      false
    );
  
    scanner.render(
      (codigoEscaneado) => {
        console.log("Código escaneado:", codigoEscaneado);
        
        // Reproducir sonido
        const beep = new Audio("/beep.mp3"); // Asegúrate de que el archivo esté en 'public/'
        beep.play().catch(error => console.error("Error al reproducir beep:", error));
  
        setCodigoProducto(codigoEscaneado);
        scanner.clear();
        document.getElementById("reader").innerHTML = "";
      },
      (error) => {
        console.error("Error al escanear:", error);
      }
    );
  };
  

  // Función para manejar cambios en la cantidad
  const handleCantidadChange = (index, newCantidad) => {
    if (/^-?\d*\.?\d*$/.test(newCantidad) || newCantidad === "") {
      const newProductos = [...productos];
      newProductos[index].cantidad = newCantidad;

      const cantidadNumerica = parseFloat(newCantidad) || 0;
      newProductos[index].subtotal = cantidadNumerica * newProductos[index].precio;

      setProductos(newProductos);

      const nuevoTotal = newProductos.reduce(
        (acc, producto) => acc + producto.subtotal,
        0
      );
      setTotalVenta(nuevoTotal);
    }
  };

  // Función para manejar el envío del formulario
  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const resultado = await agregarProducto(
        codigoProducto, 
        cantidad, 
        setProductos, 
        setTotalVenta, 
        setCodigoProducto, 
        setCantidad
      );
      if (!resultado) {
        console.log("El producto no se agrega porque es inválido.");
        return;
      }

    } catch (error) {
      console.error("Error al agregar producto:", error);
      alert("Hubo un error al agregar el producto.");
    }
  };

  


  // Función para eliminar un producto
  function handleEliminarProducto() {
    if (filaSeleccionada !== null) {
      setProductos((prevProductos) => {
        const nuevosProductos = prevProductos.filter((_, i) => i !== filaSeleccionada);
        const nuevoTotal = nuevosProductos.reduce(
          (acc, producto) => acc + producto.subtotal,
          0
        );
        setTotalVenta(nuevoTotal);
// Enfocar el input de Código del Producto después de la eliminación
        setTimeout(() => {
          inputRef.current.focus();
        }, 0);

        return nuevosProductos;
      });
      setFilaSeleccionada(null);
    }
  }

  return (
    <div className="contenedor-principal">
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
              <tr
                key={index}
                className={filaSeleccionada === index ? "seleccionado" : ""}
                onClick={() => setFilaSeleccionada(index)}
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
      <form onSubmit={handleSubmit}>
  <label>
    Código del Producto:
    <input
      ref={inputRef} // Asignar la referencia al input
      type="text"
      value={codigoProducto}
      onChange={(e) => setCodigoProducto(e.target.value)}
      required
    />
  </label>
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

  {/* Agrupar los botones en un contenedor */}
  <div className="contenedor-botones">
    <button type="submit">Agregar</button>
    <button className="boton-escanear" type="button" onClick={iniciarEscaneo}>
      Escanear Código de Barras
    </button>
    <button
      className="boton-eliminar"
      type="button"
      onClick={handleEliminarProducto}
      disabled={filaSeleccionada === null}
    >
      Eliminar
    </button>
  </div>
  </form>


    {/* Contenedor para mostrar la cámara */}
    <div id="reader"></div>

    <div className="total-venta">
      <h1>TOTAL VENTA: ${totalVenta.toFixed(2)}</h1>
    </div>
  </div>
);
};
export default VentasApp;