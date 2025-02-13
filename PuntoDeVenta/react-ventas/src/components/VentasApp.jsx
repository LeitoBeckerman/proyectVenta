import React, { useState, useEffect,useRef} from "react";
import "./VentasApp.css";
import { agregarProducto } from "../utils/productosService.js";
import { Html5QrcodeScanner, Html5QrcodeSupportedFormats } from "html5-qrcode";
import Autosuggest from 'react-autosuggest';

const VentasApp = () => {
  const [codigoProducto, setCodigoProducto] = useState("");
  const [cantidad, setCantidad] = useState("1");
  const [productos, setProductos] = useState([]);
  const [totalVenta, setTotalVenta] = useState(0.0);
  const [filaSeleccionada, setFilaSeleccionada] = useState(null);

  const [suggestions, setSuggestions] = useState([]);
  const [productName, setProductName] = useState(''); // Nuevo estado para el nombre del producto

  const inputRef = useRef(null); // Referencia para el input


  useEffect(() => {
    // Enfoca el input cuando el componente se monta
    inputRef.current.focus();
  }, []); // El array vacío [] asegura que este efecto se ejecute solo una vez al montarse el componente












  
 // Funciones para el autocompletado
  // Obtener el valor de la sugerencia
  const getSuggestionValue = (suggestion) => suggestion.nombre_producto;

  // Renderizar cada sugerencia con un click para agregarla, muestra la lista
  const renderSuggestion = (suggestion) => (
    <div
      onClick={() => {
        handleSuggestionSelected(suggestion);
        setCodigoProducto("");  // Limpiar el código del producto
        // Enfocar el input de Código del Producto después de clic
        setTimeout(() => {
          inputRef.current.focus();
          setProductName("");  // Limpiar el input de nombre del producto
        }, 0);
        
         // Volver a enfocar en el código del producto

      }}
      style={{ cursor: "pointer", padding: "5px", borderBottom: "1px solid #ddd" }}
    >
      {suggestion.nombre_producto} - ${suggestion.precio}
    </div>
  );

// Manejar la selección de una sugerencia y agregarla a la tabla
  const handleSuggestionSelected = (suggestion) => {
    const nuevaCantidad = isNaN(parseFloat(cantidad)) ? 1 : parseFloat(cantidad);
    const nuevoProducto = {
      codigo_producto: suggestion.codigo_producto,
      cantidad: nuevaCantidad,
      nombre_producto: suggestion.nombre_producto,
      precio: parseFloat(suggestion.precio),
      subtotal: nuevaCantidad * parseFloat(suggestion.precio),
    };

    setProductos((prevProductos) => [...prevProductos, nuevoProducto]);
    setTotalVenta((prevTotal) => prevTotal + nuevoProducto.subtotal);

    // Limpiar los campos
    setCodigoProducto("");
    setProductName("");
    setCantidad("1");
  };




 const onSuggestionsFetchRequested = async ({ value }) => {
   if (value.length > 1) { // Solo buscar si hay al menos 2 caracteres
     try {
       const response = await fetch("http://localhost:8000", {
         method: 'POST',
         headers: {
           'Content-Type': 'application/json',
         },
         body: JSON.stringify({ nombre_producto: value }),
       });
       const data = await response.json();
       console.log("Datos recibidos:", data);
       if (data.productos) {
         setSuggestions(data.productos); //Asigna los productos a las sugerencias.
       } else {
         setSuggestions([]);
       }
     } catch (error) {
       console.error('Error al buscar productos:', error);
       setSuggestions([]); // En caso de error, limpiar sugerencias
     }
   } else {
     setSuggestions([]); // Si el valor es demasiado corto, limpiar sugerencias
   }
 };

 const onSuggestionsClearRequested = () => {
   setSuggestions([]);
 };

 const onChange = (event, { newValue }) => {
   setProductName(newValue);
     // Filtrar sugerencias sin importar mayúsculas/minúsculas
  const filteredSuggestions = suggestions.filter(suggestion =>
    suggestion.nombre_producto.toLowerCase().includes(newValue.toLowerCase())
  );
  setSuggestions(filteredSuggestions);
};







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
      if (productName) { // Si estamos usando el autocompletado
        const selectedProduct = suggestions.find(s => s.nombre_producto.toLowerCase() === productName.toLowerCase());
        if (selectedProduct) {
          const resultado = await agregarProducto(
            selectedProduct.codigo_producto,
            cantidad,
            selectedProduct.nombre_producto,
            setProductos,
            setTotalVenta,
            () => {setCodigoProducto(""); setProductName("");},
            setCantidad
          );
          if (!resultado) {
            console.log("El producto no se agrega porque es inválido.");
            return;
          }
        } else {
          alert("Producto no encontrado en la lista de sugerencias.");
          return;
        }
      } else { // Si estamos usando el código de producto
        const resultado = await agregarProducto(
          codigoProducto,
          cantidad,
          "",
          setProductos,
          setTotalVenta,
          setCodigoProducto,
          setCantidad
        );

     
        if (!resultado) {
          console.log("El producto no se agrega porque es inválido.");
          return;
        }
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
          Nombre del Producto:
          <Autosuggest
            suggestions={suggestions}
            onSuggestionsFetchRequested={onSuggestionsFetchRequested}
            onSuggestionsClearRequested={onSuggestionsClearRequested}
            getSuggestionValue={getSuggestionValue}
            renderSuggestion={renderSuggestion}
            inputProps={{
              placeholder: 'Escribe el nombre del producto...',
              value: productName,
              onChange: onChange,
            }}
          />
      </label>
      <label>
        Código del Producto:
        <input
          ref={inputRef} // Asignar la referencia al input
          type="text"
          value={codigoProducto}
          onChange={(e) => setCodigoProducto(e.target.value)}
          //required
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