import React, { useState, useEffect } from "react";
import { Modal, Button, Form } from "react-bootstrap";

const RegistroEmpleado = ({
  showModal,
  setShowModal,
  nuevoEmpleado,
  handleInputChange,
  handleFileChange,
  handleAddEmpleado,
}) => {

  const palabrasInapropiadas = ["inapropiado", "ofensivo", "malo"];
  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const letrasEspaciosRegex = /^[A-Za-z\s]+$/;
  const telefonoRegex = /^\d{4}-\d{4}$/;
  const cedulaRegex = /^\d{3}-\d{6}-\d{4}[A-Za-z]$/;
  const contrasenaRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  const contrasenasComunes = ["123456", "password", "admin123", "contraseña"];

  const [nombreValido, setNombreValido] = useState(false);
  const [apellidoValido, setApellidoValido] = useState(false);
  const [correoValido, setCorreoValido] = useState(false);
  const [telefonoValido, setTelefonoValido] = useState(false);
  const [cedulaValida, setCedulaValida] = useState(false);
  const [contrasenaValida, setContraseñaValida] = useState(false);
  const [confirmarContrasenaValida, setConfirmarContraseñaValida] = useState(false);
  const [fechaNacimientoValida, setFechaNacimientoValida] = useState(false);
  const [fotoValida, setFotoValida] = useState(false);

  // funciones de validación...

  const validarNombre = (valor) => {
    if (!valor) return "El nombre es obligatorio";
    if (valor.length < 2 || valor.length > 50) return "El nombre debe tener entre 2 y 50 caracteres";
    if (!letrasEspaciosRegex.test(valor)) return "El nombre solo debe contener letras y espacios";
    if (palabrasInapropiadas.some(p => valor.toLowerCase().includes(p))) return "Palabra inapropiada";
    return "";
  };

  // ... repite para validarApellido, validarCorreo, etc.

  const isFormValid = () => {
    return (
      validarNombre(nuevoEmpleado.nombre) === "" &&
      validarApellido(nuevoEmpleado.apellido) === "" &&
      validarCorreo(nuevoEmpleado.correo) === "" &&
      validarTelefono(nuevoEmpleado.telefono) === "" &&
      validarCedula(nuevoEmpleado.cedula) === "" &&
      validarContrasena(nuevoEmpleado.contrasena) === "" &&
      validarConfirmarContrasena(nuevoEmpleado.confirmarContrasena, nuevoEmpleado.contrasena) === "" &&
      validarFechaNacimiento(nuevoEmpleado.fechaNacimiento) === "" &&
      validarArchivo(nuevoEmpleado.foto) === ""
    );
  };

  useEffect(() => {
    if (showModal) {
      setNombreValido(validarNombre(nuevoEmpleado.nombre) === "");
      setApellidoValido(validarApellido(nuevoEmpleado.apellido) === "");
      setCorreoValido(validarCorreo(nuevoEmpleado.correo) === "");
      setTelefonoValido(validarTelefono(nuevoEmpleado.telefono) === "");
      setCedulaValida(validarCedula(nuevoEmpleado.cedula) === "");
      setContraseñaValida(validarContrasena(nuevoEmpleado.contrasena) === "");
      setConfirmarContraseñaValida(
        validarConfirmarContrasena(nuevoEmpleado.confirmarContrasena, nuevoEmpleado.contrasena) === ""
      );
      setFechaNacimientoValida(validarFechaNacimiento(nuevoEmpleado.fechaNacimiento) === "");
      setFotoValida(validarArchivo(nuevoEmpleado.foto) === "");
    }
  }, [showModal, nuevoEmpleado]);

  return (
    <Modal show={showModal} onHide={() => setShowModal(false)}>
      <Modal.Header closeButton>
        <Modal.Title>Registro de Empleado</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {/* Aquí puedes poner el formulario con los campos de entrada */}
        {/* ... */}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={() => setShowModal(false)}>
          Cancelar
        </Button>
        <Button variant="primary" onClick={handleAddEmpleado} disabled={!isFormValid()}>
          Guardar
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default RegistroEmpleado;
