import React, { useState } from "react";
import VentasApp from "../components/VentasApp"; // Importar el componente VentasApp

const Ventas = () => {
  const [mostrarVentasApp, setMostrarVentasApp] = useState(false); // Estado para mostrar u ocultar VentasApp

  // Función que cambia el estado cuando se hace clic en el botón
  const iniciarVentas = () => {
    setMostrarVentasApp(true);
  };

  return (
    <div>
      <h1>Pagina de VENTAS</h1>
      <button onClick={iniciarVentas}>Iniciar Ventas APP</button>

      {mostrarVentasApp && <VentasApp />} {/* Mostrar VentasApp si mostrarVentasApp es true */}
    </div>
  );
};

export default Ventas;
