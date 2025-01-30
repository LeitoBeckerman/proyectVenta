export const agregarProducto = async (codigoProducto, cantidad, setProductos, setTotalVenta, setCodigoProducto, setCantidad) => {
    try {
      const response = await fetch("http://localhost:8000", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          codigo_producto: codigoProducto,
        }),
      });
  
      const data = await response.json();
  
      if (data.error) {
        alert(data.error);
        //return;
      }
  
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
    } catch (error) {
      console.error("Error en la solicitud:", error);
    }
  };
  