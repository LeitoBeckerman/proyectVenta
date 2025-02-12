export const agregarProducto = async (codigoProducto, cantidad, nombreProducto, setProductos, setTotalVenta, setCodigoProducto, setCantidad) => {
  try {
    const data = await buscarProducto(codigoProducto, nombreProducto);
    if (data && !data.error) {
      const nuevoProducto = crearNuevoProducto(data, codigoProducto, cantidad);
      actualizarEstado(nuevoProducto, setProductos, setTotalVenta, setCodigoProducto, setCantidad);
      return true;
    } else {
      alert(data ? data.error : "Producto no encontrado o error en la solicitud.");
      return false;
    }
  } catch (error) {
    console.error("Error en la solicitud:", error);
    return false;
  }
};

const buscarProducto = async (codigoProducto, nombreProducto) => {
  const endpoint = "http://localhost:8000";
  const body = nombreProducto ? { nombre_producto: nombreProducto } : { codigo_producto: codigoProducto };
  
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  return await response.json();
};

const crearNuevoProducto = (data, codigoProducto, cantidad) => {
  if (Array.isArray(data.productos) && data.productos.length > 0) {
    // Si es una búsqueda por nombre, asumimos que el primer resultado es el seleccionado
    return {
      ...data.productos[0],
      cantidad,
      subtotal: parseFloat(data.productos[0].precio) * (parseFloat(cantidad) || 0),
    };
  } else {
    return {
      ...data,
      codigo_producto: codigoProducto,
      cantidad,
      precio: parseFloat(data.precio),
      subtotal: parseFloat(data.precio) * (parseFloat(cantidad) || 0),
    };
  }
};

const actualizarEstado = (nuevoProducto, setProductos, setTotalVenta, setCodigoProducto, setCantidad) => {
  setProductos(prevProductos => {
    const nuevosProductos = [...prevProductos, nuevoProducto];
    const nuevoTotal = nuevosProductos.reduce((acc, producto) => acc + producto.subtotal, 0);
    setTotalVenta(nuevoTotal);
    return nuevosProductos;
  });
  setCodigoProducto("");
  setCantidad("1");
};