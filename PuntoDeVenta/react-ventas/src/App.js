import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"; // Importar los componentes necesarios de react-router-dom
import VerticalMenu from "./components/VerticalMenu";
// import About from "./pages/About";
import Contact from "./pages/Contact";
import Home from "./pages/Home";  // Asegúrate de importar la página de Home
import Ventas from "./pages/Ventas";  // Asegúrate de importar la página de Ventas
import "./App.css";

const App = () => {
  return (
    <Router> {/* Configuración del Router */}
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {/* Menú vertical */}
      <VerticalMenu />
      {/* Contenido dinámico */}
      <div className="main-content">
        {/* Configuración de las rutas */}
        <Routes>
          <Route path="/" element={<Home />} />  {/* Página principal (Home) */}
          <Route path="/ventas" element={<Ventas />} />
           {/* <Route path="/about" element={<About />} /> */}
          <Route path="/contact" element={<Contact />} />
        </Routes>
      </div>
    </div>
  </Router>
  );
};

export default App;

