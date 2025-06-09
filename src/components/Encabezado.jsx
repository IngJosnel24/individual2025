import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import Offcanvas from "react-bootstrap/Offcanvas";
import NavDropdown from "react-bootstrap/NavDropdown";
import logo from "../assets/react.svg";
import { useAuth } from "../database/authcontext";
import 'bootstrap-icons/font/bootstrap-icons.css';
import { useTranslation } from 'react-i18next';

import "../App.css";

const Encabezado = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { isLoggedIn, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      // Cerrar el offcanvas antes de proceder
      setIsCollapsed(false);

      // Eliminar variables almacenadas en localStorage
      localStorage.removeItem("adminEmail");
      localStorage.removeItem("adminPassword");

      // Cerrar sesión
      await logout();

      // Redirigir al inicio
      navigate("/");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  const handleToggle = () => setIsCollapsed(!isCollapsed);

  // Funciones de navegación
  const handleNavigate = (path) => {
    navigate(path);
    setIsCollapsed(false);
  };

  //método para cambiar el idioma
  const { t, i18n } = useTranslation();

  const cambiarIdioma = (lang) => {
    i18n.changeLanguage(lang);
  }

  return (
    <Navbar expand="sm" fixed="top" className="color-navbar">
      <Container>
        <Navbar.Brand onClick={() => handleNavigate("/inicio")} className="text-white" style={{ cursor: "pointer" }}>
          <img alt="" src={logo} width="30" height="30" className="d-inline-block align-top" />{" "}
          <strong>Ferreteria</strong>
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="offcanvasNavbar-expand-sm" onClick={handleToggle} />
        <Navbar.Offcanvas
          id="offcanvasNavbar-expand-sm"
          aria-labelledby="offcanvasNavbarLabel-expand-sm"
          placement="end"
          show={isCollapsed}
          onHide={() => setIsCollapsed(false)}
        >
          <Offcanvas.Header closeButton>
            <Offcanvas.Title
              id="offcanvasNavbarLabel-expand-sm"
              className={isCollapsed ? "color-texto-marca" : "text-white"}
            >
              Menú
            </Offcanvas.Title>
          </Offcanvas.Header>
          <Offcanvas.Body>
            <Nav className="justify-content-end flex-grow-1 pe-3">
              <Nav.Link
                onClick={() => handleNavigate("/inicio")}
                className={isCollapsed ? "color-texto-marca" : "text-white"}
              >
                {isCollapsed ? <i className="bi-house-door-fill me-2"></i> : null}
                <Nav.Link>{t('menu.inicio')}</Nav.Link>
              </Nav.Link>
              <Nav.Link
                onClick={() => handleNavigate("/Catalogo")}
                className={isCollapsed ? "color-texto-marca" : "text-white"}
              >
                <Nav.Link>{t('menu.catalogo')}</Nav.Link>
              </Nav.Link>
              <Nav.Link
                onClick={() => handleNavigate("/categorias")}
                className={isCollapsed ? "color-texto-marca" : "text-white"}
              >
                 <Nav.Link>{t('menu.categorias')}</Nav.Link>
              </Nav.Link>
              <Nav.Link
                onClick={() => handleNavigate("/productos")}
                className={isCollapsed ? "color-texto-marca" : "text-white"}
              >
                 <Nav.Link>{t('menu.productos')}</Nav.Link>
              </Nav.Link>

              <Nav.Link
                onClick={() => handleNavigate ("/pronunciacion")}
                className={isCollapsed ? "color-texto-marca" : "text-white"}
              >
                 <Nav.Link>{t('menu.pronunciacion')}</Nav.Link>
              </Nav.Link>
              <Nav.Link
                onClick={() => handleNavigate("/clima")}
                className={isCollapsed ? "color-texto-marca" : "text-white"}
              >
                {isCollapsed ? <i className="bi-cloud-sun-fill me-2"></i> : null}
                <Nav.Link>{t('menu.clima')}</Nav.Link>

              </Nav.Link>
               <Nav.Link onClick={() => handleNavigate("/estadisticas")} className="text-white">
                <Nav.Link>{t('menu.estadisticas')}</Nav.Link>
              </Nav.Link>

              <Nav.Link onClick={() => handleNavigate("/empleados")} className="text-white">
                <Nav.Link>{t('menu.empleados')}</Nav.Link>
              </Nav.Link>


              {isLoggedIn ? (
                <>
                  <Nav.Link onClick={handleLogout} className={isCollapsed ? "text-black" : "text-white"}>
                   <Nav.Link>{t('menu.cerrarSesion')}</Nav.Link>
                  </Nav.Link>
                </>
              ) : location.pathname === "/" && (
                <Nav.Link
                  onClick={() => handleNavigate("/")}
                  className={isCollapsed ? "text-black" : "text-white"}
                >
                 <Nav.Link>{t('menu.iniciarSesion')}</Nav.Link>
                </Nav.Link>
              )}

               <NavDropdown 
                title={
                  <span>
                    <i className="bi-translate me-2"></i>
                    {isCollapsed && <span>{t('menu.idioma')}</span>}
                  </span>
                }
                  id="basic-nav-dropdown"
                  className={isCollapsed ? "color-texto-marca":"texto-blanco"}
                >
                <NavDropdown.Item
                  onClick={() => cambiarIdioma ('es')}
                  className="text-black"
                >
                  <strong>{t('menu.español')}</strong>
                </NavDropdown.Item>

                <NavDropdown.Item
                  onClick={() => cambiarIdioma ('en')}
                  className="text-black"
                >
                  <strong>{t('menu.ingles')}</strong>
                </NavDropdown.Item>
                
              </NavDropdown>
              
            </Nav>
          </Offcanvas.Body>
        </Navbar.Offcanvas>
      </Container>
    </Navbar>
  );
};

export default Encabezado;
