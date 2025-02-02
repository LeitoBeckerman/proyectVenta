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
      <h1>VENTAS Caja Express</h1>

      {/* Mostrar el botón solo si mostrarVentasApp es false */}
      {!mostrarVentasApp && (
        <button onClick={iniciarVentas}>Iniciar Ventas APP</button>
      )}

      {/* Mostrar VentasApp si mostrarVentasApp es true */}
      {mostrarVentasApp && <VentasApp />}
    </div>
  );
};
export default Ventas;

