import React, { useState, useEffect,useRef} from "react";
import "./VentasApp.css";
import { agregarProducto, buscarProductosParaEdicion, actualizarProducto, crearProductoBD, verificarProductoDuplicado } from "../utils/productosService.js";
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

  // Nuevo estado para mostrar el resumen y ref para impresión
  const [mostrarResumen, setMostrarResumen] = useState(false);
  const resumenRef = useRef(null);

  // Estados para el modal de edición de productos
  const [mostrarModalEdicion, setMostrarModalEdicion] = useState(false);
  const [productosSearchEdicion, setProductosSearchEdicion] = useState([]);
  const [busquedaProductoEdicion, setBusquedaProductoEdicion] = useState("");
  const [productoSeleccionadoEdicion, setProductoSeleccionadoEdicion] = useState(null);
  const [dataProductoEdicion, setDataProductoEdicion] = useState({
    id: "",
    codigo_producto: "",
    nombre_producto: "",
    marca: "",
    unidad_venta: "",
    precio: "",
  });

  const [mensajeConfirmacion, setMensajeConfirmacion] = useState("");
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);

  // Estados para el modal de creación de productos
  const [mostrarModalCreacion, setMostrarModalCreacion] = useState(false);
  const [datosNuevoProducto, setDatosNuevoProducto] = useState({
    codigo_producto: "",
    nombre_producto: "",
    marca: "",
    unidad_venta: "UN",
    precio: "",
  });
  const [errorCreacion, setErrorCreacion] = useState("");


  useEffect(() => {
    // Enfoca el input cuando el componente se monta
    inputRef.current.focus();
  }, []); // El array vacío [] asegura que este efecto se ejecute solo una vez al montarse el componente












  
 // Funciones para el autocompletado
  const getNombreProducto = (item) => item.nombre_producto || item.nombre || "";

  const getSuggestionValue = (suggestion) => getNombreProducto(suggestion);

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
      }}
      style={{ cursor: "pointer", padding: "5px", borderBottom: "1px solid #ddd" }}
    >
      {suggestion.nombre || suggestion.nombre_producto} - {suggestion.marca} - ${suggestion.precio}
    </div>
  );

// Manejar la selección de una sugerencia y agregarla a la tabla
  const handleSuggestionSelected = (suggestion) => {
    const nuevaCantidad = isNaN(parseFloat(cantidad)) ? 1 : parseFloat(cantidad);
    const nombreBase = getNombreProducto(suggestion);
    const alias = suggestion.alias_ticket && suggestion.alias_ticket.trim() !== ''
      ? suggestion.alias_ticket
      : nombreBase;
    const nombreConMarca = suggestion.marca
      ? `${nombreBase} ${suggestion.marca}`.trim()
      : nombreBase;

    const nuevoProducto = {
      codigo_producto: suggestion.codigo_producto || suggestion.codigo || "",
      cantidad: nuevaCantidad,
      nombre_producto: suggestion.alias_ticket || nombreConMarca,
      nombre: suggestion.nombre || suggestion.nombre_producto || "",
      marca: suggestion.marca || "",
      alias_ticket: alias,
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
       const response = await fetch("http://192.168.0.103:8000", {
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
  const lowerValue = newValue.toLowerCase();
  const filteredSuggestions = suggestions.filter(suggestion => {
    const suggestionNombre = getNombreProducto(suggestion).toLowerCase();
    return (
      suggestionNombre.includes(lowerValue) ||
      (suggestion.alias_ticket && suggestion.alias_ticket.toLowerCase().includes(lowerValue))
    );
  });
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
        const lowerValue = productName.toLowerCase();
        const selectedProduct = suggestions.find(s => {
          const suggestionNombre = getNombreProducto(s).toLowerCase();
          return (
            suggestionNombre === lowerValue ||
            (s.alias_ticket && s.alias_ticket.toLowerCase() === lowerValue)
          );
        });
        if (selectedProduct) {
          const nombreProductoSeleccionado = getNombreProducto(selectedProduct);
          const resultado = await agregarProducto(
            selectedProduct.codigo_producto || selectedProduct.codigo,
            cantidad,
            nombreProductoSeleccionado,
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
  
  // Mostrar el resumen en la misma pantalla
  const finalizarVenta = () => {
    setMostrarResumen(true);
    setTimeout(() => {
      if (resumenRef.current) resumenRef.current.scrollIntoView({ behavior: 'smooth' });
    }, 0);
  };
  
  // Imprimir solo el resumen (usa una clase temporal en el body para las reglas @media print)
  const imprimirTicket = () => {
    document.body.classList.add('only-print-resumen');
    // Dejar tiempo para que la clase se aplique
    setTimeout(() => {
      window.print();
      // Quitar la clase después de imprimir
      setTimeout(() => document.body.classList.remove('only-print-resumen'), 500);
    }, 100);
  };

  // Funciones para el modal de edición de productos
  const abrirModalEdicion = () => {
    setMostrarModalEdicion(true);
    setBusquedaProductoEdicion("");
    setProductosSearchEdicion([]);
    setProductoSeleccionadoEdicion(null);
    setDataProductoEdicion({
      id: "",
      codigo_producto: "",
      nombre_producto: "",
      marca: "",
      unidad_venta: "",
      precio: "",
    });
  };

  const cerrarModalEdicion = () => {
    setMostrarModalEdicion(false);
    setBusquedaProductoEdicion("");
    setProductosSearchEdicion([]);
    setProductoSeleccionadoEdicion(null);
  };

  const handleBuscarProductosEdicion = async (e) => {
    const valor = e.target.value;
    setBusquedaProductoEdicion(valor);

    if (valor.length > 1) {
      const productos = await buscarProductosParaEdicion(valor);
      setProductosSearchEdicion(productos);
    } else {
      setProductosSearchEdicion([]);
    }
  };

  const handleSeleccionarProductoEdicion = (producto) => {
    setProductoSeleccionadoEdicion(producto);
    setDataProductoEdicion({
      id: producto.id || "",
      codigo_producto: producto.codigo_producto || "",
      nombre_producto: producto.nombre_producto || "",
      alias_ticket: producto.alias_ticket || "",
      marca: producto.marca || "",
      unidad_venta: producto.unidad_venta || "",
      precio: producto.precio || "",
    });
    setProductosSearchEdicion([]);
  };

  const handleCambiarDatosEdicion = (field, value) => {
    setDataProductoEdicion(prevData => ({
      ...prevData,
      [field]: value,
    }));
  };

  const handleGuardarCambios = async () => {
    if (!productoSeleccionadoEdicion) {
      alert("Por favor selecciona un producto.");
      return;
    }

    // Preguntar confirmación
    const confirmacion = window.confirm(
      "¿Estás seguro de que deseas guardar los cambios en este producto?"
    );

    if (confirmacion) {
      const resultado = await actualizarProducto(dataProductoEdicion);

      if (resultado.success) {
        setMensajeConfirmacion("✓ Producto actualizado correctamente");
        setMostrarConfirmacion(true);
        setTimeout(() => {
          setMostrarConfirmacion(false);
          cerrarModalEdicion();
        }, 2000);
      } else {
        alert("Error: " + resultado.error);
      }
    }
  };

  const handleCancelarEdicion = () => {
    cerrarModalEdicion();
  };

  // Funciones para el modal de creación de productos
  const abrirModalCreacion = () => {
    setMostrarModalCreacion(true);
    setDatosNuevoProducto({
      codigo_producto: "",
      nombre_producto: "",
      marca: "",
      unidad_venta: "UN",
      precio: "",
    });
    setErrorCreacion("");
  };

  const cerrarModalCreacion = () => {
    setMostrarModalCreacion(false);
    setDatosNuevoProducto({
      codigo_producto: "",
      nombre_producto: "",
      marca: "",
      unidad_venta: "UN",
      precio: "",
    });
    setErrorCreacion("");
  };

  const handleCambiarDatosCreacion = (field, value) => {
    setDatosNuevoProducto(prevData => ({
      ...prevData,
      [field]: value,
    }));
    // Limpiar errores cuando el usuario empieza a escribir
    if (errorCreacion) {
      setErrorCreacion("");
    }
  };

  const validarDatosProducto = () => {
    if (!datosNuevoProducto.codigo_producto.trim()) {
      setErrorCreacion("El código del producto es obligatorio");
      return false;
    }
    if (!datosNuevoProducto.nombre_producto.trim()) {
      setErrorCreacion("El nombre del producto es obligatorio");
      return false;
    }
    if (!datosNuevoProducto.marca.trim()) {
      setErrorCreacion("La marca es obligatoria");
      return false;
    }
    if (!datosNuevoProducto.precio || parseFloat(datosNuevoProducto.precio) <= 0) {
      setErrorCreacion("El precio debe ser mayor a 0");
      return false;
    }
    return true;
  };

  const handleGuardarProducto = async () => {
    if (!validarDatosProducto()) {
      return;
    }

    // Verificar si el producto ya existe
    const productoDuplicado = await verificarProductoDuplicado(datosNuevoProducto.codigo_producto);
    
    if (productoDuplicado) {
      setErrorCreacion("⚠️ Producto duplicado, debe actualizar no agregar producto");
      return;
    }

    const resultado = await crearProductoBD(datosNuevoProducto);

    if (resultado.success) {
      setMensajeConfirmacion("✓ Producto creado correctamente");
      setMostrarConfirmacion(true);
      setTimeout(() => {
        setMostrarConfirmacion(false);
        cerrarModalCreacion();
      }, 2000);
    } else {
      setErrorCreacion(resultado.error || "Error al crear el producto");
    }
  };

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
                <td>{producto.nombre ? `${producto.nombre} ${producto.marca}` : producto.nombre_producto}</td>
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
     <button className="boton-crear-producto" type="button" onClick={abrirModalCreacion}>
       Crear Producto
     </button>
     <button className="boton-actualizar" type="button" onClick={abrirModalEdicion}>
       Actualizar Producto
     </button>
    <button type="button" onClick={finalizarVenta}>Finalizar Venta</button>
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

     {/* Modal para editar productos */}
     {mostrarModalEdicion && (
       <div className="modal-overlay">
         <div className="modal-edicion">
           <div className="modal-header">
             <h2>Actualizar Producto</h2>
             <button className="btn-cerrar-modal" onClick={handleCancelarEdicion}>×</button>
           </div>

           {!productoSeleccionadoEdicion ? (
             <div className="modal-busqueda">
               <h3>Buscar Producto</h3>
               <input
                 type="text"
                 placeholder="Escribe el nombre del producto..."
                 value={busquedaProductoEdicion}
                 onChange={handleBuscarProductosEdicion}
                 className="input-busqueda-edicion"
               />
               {productosSearchEdicion.length > 0 && (
                 <div className="lista-productos-edicion">
                   {productosSearchEdicion.map((producto) => (
                     <div
                       key={producto.id}
                       className="item-producto-edicion"
                       onClick={() => handleSeleccionarProductoEdicion(producto)}
                     >
                       <strong>{producto.nombre_producto}</strong> - {producto.marca}
                       <br />
                       <small>Código: {producto.codigo_producto} | Precio: ${producto.precio}</small>
                     </div>
                   ))}
                 </div>
               )}
             </div>
           ) : (
             <div className="modal-edicion-campos">
               <h3>Editar Datos del Producto</h3>
               
               <div className="campo-edicion">
                 <label>ID:</label>
                 <input
                   type="text"
                   value={dataProductoEdicion.id}
                   disabled
                   className="input-disabled"
                 />
               </div>

               <div className="campo-edicion">
                 <label>Código del Producto:</label>
                 <input
                   type="text"
                   value={dataProductoEdicion.codigo_producto}
                   onChange={(e) => handleCambiarDatosEdicion("codigo_producto", e.target.value)}
                 />
               </div>

               <div className="campo-edicion">
                 <label>Nombre del Producto:</label>
                 <input
                   type="text"
                   value={dataProductoEdicion.nombre_producto}
                   onChange={(e) => handleCambiarDatosEdicion("nombre_producto", e.target.value)}
                 />
               </div>

               <div className="campo-edicion">
                 <label>Alias Ticket:</label>
                 <input
                   type="text"
                   value={dataProductoEdicion.alias_ticket}
                   onChange={(e) => handleCambiarDatosEdicion("alias_ticket", e.target.value)}
                 />
               </div>

               <div className="campo-edicion">
                 <label>Marca:</label>
                 <input
                   type="text"
                   value={dataProductoEdicion.marca}
                   onChange={(e) => handleCambiarDatosEdicion("marca", e.target.value)}
                 />
               </div>

               <div className="campo-edicion">
                 <label>Unidad de Venta:</label>
                 <input
                   type="text"
                   value={dataProductoEdicion.unidad_venta}
                   onChange={(e) => handleCambiarDatosEdicion("unidad_venta", e.target.value)}
                 />
               </div>

               <div className="campo-edicion">
                 <label>Precio:</label>
                 <input
                   type="number"
                   value={dataProductoEdicion.precio}
                   onChange={(e) => handleCambiarDatosEdicion("precio", e.target.value)}
                   step="0.01"
                 />
               </div>

               <div className="botones-edicion">
                 <button className="btn-guardar" onClick={handleGuardarCambios}>
                   Guardar Cambios
                 </button>
                 <button className="btn-cancelar" onClick={() => setProductoSeleccionadoEdicion(null)}>
                   Volver a Buscar
                 </button>
                 <button className="btn-cerrar" onClick={handleCancelarEdicion}>
                   Cancelar
                 </button>
               </div>
             </div>
           )}
         </div>
       </div>
     )}

     {/* Mensaje de confirmación */}
     {mostrarConfirmacion && (
       <div className="confirmacion-banner">
         {mensajeConfirmacion}
       </div>
     )}

     {/* Modal para crear nuevo producto */}
     {mostrarModalCreacion && (
       <div className="modal-overlay">
         <div className="modal-creacion">
           <div className="modal-header">
             <h2>Crear Nuevo Producto</h2>
             <button className="btn-cerrar-modal" onClick={cerrarModalCreacion}>×</button>
           </div>

           <div className="modal-creacion-campos">
             {errorCreacion && (
               <div className="error-banner">
                 ⚠️ {errorCreacion}
               </div>
             )}

             <div className="campo-creacion">
               <label>Código del Producto:</label>
               <input
                 type="text"
                 placeholder="Ej: ABC123456"
                 value={datosNuevoProducto.codigo_producto}
                 onChange={(e) => handleCambiarDatosCreacion("codigo_producto", e.target.value)}
                 className="input-creacion"
               />
             </div>

             <div className="campo-creacion">
               <label>Nombre del Producto:</label>
               <input
                 type="text"
                 placeholder="Ej: Leche Descremada"
                 value={datosNuevoProducto.nombre_producto}
                 onChange={(e) => handleCambiarDatosCreacion("nombre_producto", e.target.value)}
                 className="input-creacion"
               />
             </div>

             <div className="campo-creacion">
               <label>Alias Ticket:</label>
               <input
                 type="text"
                 placeholder="Ej: Leche Desc. 1L"
                 value={datosNuevoProducto.alias_ticket}
                 onChange={(e) => handleCambiarDatosCreacion("alias_ticket", e.target.value)}
                 className="input-creacion"
               />
             </div>

             <div className="campo-creacion">
               <label>Marca:</label>
               <input
                 type="text"
                 placeholder="Ej: La Serenísima"
                 value={datosNuevoProducto.marca}
                 onChange={(e) => handleCambiarDatosCreacion("marca", e.target.value)}
                 className="input-creacion"
               />
             </div>

             <div className="campo-creacion">
               <label>Unidad de Venta:</label>
               <select
                 value={datosNuevoProducto.unidad_venta}
                 onChange={(e) => handleCambiarDatosCreacion("unidad_venta", e.target.value)}
                 className="select-creacion"
               >
                 <option value="UN">Unidad (UN)</option>
                 <option value="KG">Kilogramo (KG)</option>
               </select>
             </div>

             <div className="campo-creacion">
               <label>Precio:</label>
               <input
                 type="number"
                 placeholder="Ej: 99.99"
                 value={datosNuevoProducto.precio}
                 onChange={(e) => handleCambiarDatosCreacion("precio", e.target.value)}
                 className="input-creacion"
                 step="0.01"
                 min="0"
               />
             </div>

             <div className="botones-creacion">
               <button className="btn-aceptar" onClick={handleGuardarProducto}>
                 Aceptar
               </button>
               <button className="btn-cancelar-creacion" onClick={cerrarModalCreacion}>
                 Cancelar
               </button>
             </div>
           </div>
         </div>
       </div>
     )}
     {mostrarResumen && (
      <div className="resumen-venta" ref={resumenRef}>
        <h2>Ticket De Compra</h2>

        <div className="ticket-header">
          <span>DETALLE</span>
          <span className="importe-col">IMPORTE</span>
        </div>

        <div className="ticket-items">
          {productos.map((producto, index) => {
            const alias = producto.alias_ticket && producto.alias_ticket.trim() !== ''
              ? producto.alias_ticket
              : producto.nombre_producto;
            return (
              <div key={index} className="ticket-item">
                <div className="ticket-item-name">{alias}</div>
                <div className="ticket-item-detail">
                  <span>{producto.cantidad} x ${parseFloat(producto.precio).toFixed(2)}</span>
                  <span className="importe-col">${parseFloat(producto.subtotal).toFixed(2)}</span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="resumen-acciones">
          <h3>TOTAL: ${totalVenta.toFixed(2)}</h3>
          <div className="botones-resumen">
            <button type="button" onClick={imprimirTicket}>Imprimir Ticket</button>
            <button type="button" onClick={() => setMostrarResumen(false)}>Cerrar</button>
          </div>
        </div>
      </div>
    )}

     <div className="total-venta">
       <h1>TOTAL VENTA: ${totalVenta.toFixed(2)}</h1>
     </div>
   </div>
 );
 };
 export default VentasApp;
