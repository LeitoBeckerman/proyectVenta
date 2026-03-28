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

// Función para buscar productos por nombre en la edición
export const buscarProductosParaEdicion = async (nombreProducto) => {
  if (!nombreProducto || nombreProducto.length < 2) {
    return [];
  }

  try {
    const response = await fetch("http://localhost:8000", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ nombre_producto: nombreProducto }),
    });

    const data = await response.json();
    return data.productos || [];
  } catch (error) {
    console.error('Error al buscar productos:', error);
    return [];
  }
};

// Función para actualizar un producto en la BD
export const actualizarProducto = async (productoActualizado) => {
  try {
    const response = await fetch("http://localhost:8000/editar-producto", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(productoActualizado),
    });

    const data = await response.json();
    if (data && !data.error) {
      return { success: true, mensaje: "Producto actualizado correctamente" };
    } else {
      return { success: false, error: data ? data.error : "Error al actualizar el producto" };
    }
  } catch (error) {
    console.error("Error al actualizar producto:", error);
    return { success: false, error: "Error en la solicitud" };
  }
};

// Función para verificar si un producto ya existe por código
export const verificarProductoDuplicado = async (codigoProducto) => {
  try {
    const response = await fetch("http://localhost:8000", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ codigo_producto: codigoProducto }),
    });

    const data = await response.json();
    // Si encontró un producto con ese código, devuelve true (existe)
    return data.productos && data.productos.length > 0;
  } catch (error) {
    console.error("Error al verificar producto duplicado:", error);
    return false;
  }
};

// Función para crear un nuevo producto en la BD
export const crearProductoBD = async (datosProducto) => {
  try {
    const response = await fetch("http://localhost:8000/crear-producto", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(datosProducto),
    });

    const data = await response.json();
    if (data && !data.error) {
      return { success: true, mensaje: "Producto creado correctamente", producto: data.producto };
    } else {
      return { success: false, error: data ? data.error : "Error al crear el producto" };
    }
  } catch (error) {
    console.error("Error al crear producto:", error);
    return { success: false, error: "Error en la solicitud" };
  }
};