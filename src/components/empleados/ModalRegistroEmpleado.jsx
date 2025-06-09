import React, { useState } from "react";
import { Modal, Form, Button } from "react-bootstrap";

const ModalRegistroEmpleado = ({
  showModal,
  setShowModal,
  nuevoEmpleado,
  handleInputChange,
  handleImageChange,
  handleAddEmpleado
}) => {
  const palabrasInapropiadas = ["impropio", "ofensivo", "malo"];
  const letrasRegex = /^[A-Za-zÁÉÍÓÚáéíóúñÑ ]+$/;
  const correoRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const telefonoRegex = /^\d{4}-\d{4}$/;
  const cedulaRegex = /^\d{3}-\d{6}-\d{4}[A-Za-z]$/;
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  const passwordsComunes = ["Password123", "Admin123", "Contraseña"];

  const [errores, setErrores] = useState({});
  const [archivoValido, setArchivoValido] = useState(false);

  const validarCampo = (name, value) => {
    switch (name) {
      case "nombre":
      case "apellido":
        if (!value) return "Campo obligatorio.";
        if (!letrasRegex.test(value)) return "Solo letras y espacios.";
        if (value.length < 2 || value.length > 50) return "Debe tener entre 2 y 50 caracteres.";
        if (palabrasInapropiadas.some(p => value.toLowerCase().includes(p))) return "Contiene palabras inapropiadas.";
        break;
      case "correo":
        if (!value) return "Campo obligatorio.";
        if (!correoRegex.test(value)) return "Correo inválido.";
        break;
      case "telefono":
        if (!value) return "Campo obligatorio.";
        if (!telefonoRegex.test(value)) return "Formato debe ser xxxx-xxxx.";
        break;
      case "cedula":
        if (!value) return "Campo obligatorio.";
        if (!cedulaRegex.test(value)) return "Formato incorrecto (ej: 001-030485-0001A).";
        break;
      case "password":
        if (!value) return "Campo obligatorio.";
        if (!passwordRegex.test(value)) return "Debe tener mayúsculas, minúsculas, números y símbolos.";
        if (passwordsComunes.includes(value)) return "Contraseña común.";
        break;
      case "confirmPassword":
        if (!value) return "Campo obligatorio.";
        if (value !== nuevoEmpleado.password) return "No coincide con la contraseña.";
        break;
      case "fechaNacimiento":
        if (!value) return "Campo obligatorio.";
        const fecha = new Date(value);
        const hoy = new Date();
        const edad = hoy.getFullYear() - fecha.getFullYear();
        if (fecha > hoy) return "Fecha futura no permitida.";
        if (edad < 18) return "Debe ser mayor de 18 años.";
        break;
      default:
        return "";
    }
    return "";
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    const error = validarCampo(name, value);
    setErrores({ ...errores, [name]: error });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    let error = "";

    if (!file) {
      error = "Archivo obligatorio.";
    } else if (file.size > 2 * 1024 * 1024) {
      error = "Máximo 2MB.";
    } else if (!['image/jpeg', 'image/png'].includes(file.type)) {
      error = "Solo JPG o PNG.";
    }

    setErrores({ ...errores, imagen: error });
    setArchivoValido(!error);
    if (!error) handleImageChange(e);
  };

  const handleKeyPress = (e) => {
    if (e.target.name === "telefono") {
      const charCode = e.which || e.keyCode;
      if (charCode !== 45 && (charCode < 48 || charCode > 57)) e.preventDefault();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const campos = [
      "nombre", "apellido", "correo", "telefono", "cedula",
      "password", "confirmPassword", "fechaNacimiento"
    ];
    const nuevosErrores = {};

    campos.forEach((campo) => {
      const error = validarCampo(campo, nuevoEmpleado[campo]);
      if (error) nuevosErrores[campo] = error;
    });

    setErrores(nuevosErrores);

    const esValido = Object.keys(nuevosErrores).length === 0 && archivoValido;
    if (esValido) {
      handleAddEmpleado();
      setShowModal(false);
    }
  };

  return (
    <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Registrar Nuevo Empleado</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          {["nombre", "apellido", "correo", "telefono", "cedula", "password", "confirmPassword", "fechaNacimiento"].map((campo) => (
            <Form.Group className="mb-3" key={campo}>
              <Form.Label>{campo.charAt(0).toUpperCase() + campo.slice(1)}</Form.Label>
              <Form.Control
                type={campo.includes("password") ? "password" : campo === "fechaNacimiento" ? "date" : "text"}
                name={campo}
                value={nuevoEmpleado[campo]}
                onChange={handleInputChange}
                onBlur={handleBlur}
                onKeyPress={campo === "telefono" ? handleKeyPress : undefined}
                isInvalid={!!errores[campo]}
                placeholder={campo === "telefono" ? "xxxx-xxxx" : ""}
              />
              <Form.Control.Feedback type="invalid">
                {errores[campo]}
              </Form.Control.Feedback>
            </Form.Group>
          ))}

          <Form.Group className="mb-3">
            <Form.Label>Fotografía</Form.Label>
            <Form.Control
              type="file"
              name="imagen"
              accept="image/jpeg, image/png"
              onChange={handleFileChange}
              isInvalid={!!errores.imagen}
            />
            <Form.Control.Feedback type="invalid">
              {errores.imagen}
            </Form.Control.Feedback>
          </Form.Group>

          <Button variant="primary" type="submit">Registrar</Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default ModalRegistroEmpleado;