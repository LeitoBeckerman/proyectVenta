export const calcularSubtotal = (cantidad, precio) => {
    return cantidad * precio;
  };
  
  export const calcularTotalVenta = (productos) => {
    return productos.reduce((acc, producto) => acc + producto.subtotal, 0);
  };