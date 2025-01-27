import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./VerticalMenu.css";
import { RxHome } from "react-icons/rx";
import { RiMailLine } from "react-icons/ri";
import { TbCashRegister } from "react-icons/tb";

const VerticalMenu = () => {
  const [isOpen, setIsOpen] = useState(false); // Corrección en el estado

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div>
      {/* Botón de hamburguesa */}
      <button onClick={toggleMenu} className="menu-button">
        ☰
      </button>

      {/* Menú deslizable */}
      {isOpen && ( // Corrección para verificar si el menú está abierto
        <div className="menu-container">
          <div className="menu-header">
            <h2>Menú</h2>
            <button onClick={toggleMenu} className="close-button">
              ×
            </button>
          </div>
          <ul className="menu-list">
            <li className="itemHome">
              <Link to="/" onClick={toggleMenu}>
                Home  <RxHome /> 
              </Link>
            </li>
            <li className="itemVentas">
              <Link to="/ventas" onClick={toggleMenu}>
                Ventas <TbCashRegister />
              </Link>
            </li>
            <li className="itemContact">
              <Link to="/contact" onClick={toggleMenu}>
                Contact <RiMailLine />
              </Link>
            </li>
            {/* Agrega más enlaces según sea necesario */}
          </ul>
        </div>
      )}
    </div>
  );
};

export default VerticalMenu;
