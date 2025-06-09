import React, { useState, useEffect } from "react";
import { Modal, Form, Button } from "react-bootstrap";

const ModalEditarEmpleado = ({
  show,
  onHide,
  empleadoSeleccionado,
  handleActualizarEmpleado
}) => {
  const [empleado, setEmpleado] = useState({ ...empleadoSeleccionado });
  const [errores, setErrores] = useState({});

  useEffect(() => {
    setEmpleado({ ...empleadoSeleccionado });
    setErrores({});
  }, [empleadoSeleccionado]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEmpleado((prev) => ({ ...prev, [name]: value }));
  };

  const validarCampos = () => {
    const nuevosErrores = {};
    if (!empleado.nombre) nuevosErrores.nombre = "Nombre obligatorio";
    if (!empleado.apellido) nuevosErrores.apellido = "Apellido obligatorio";
    if (!empleado.correo) nuevosErrores.correo = "Correo obligatorio";
    if (!empleado.telefono) nuevosErrores.telefono = "Teléfono obligatorio";
    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validarCampos()) {
      handleActualizarEmpleado(empleado);
      onHide();
    }
  };

  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>Editar Empleado</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          {["nombre", "apellido", "correo", "telefono"].map((campo) => (
            <Form.Group className="mb-3" key={campo}>
              <Form.Label>{campo.charAt(0).toUpperCase() + campo.slice(1)}</Form.Label>
              <Form.Control
                type="text"
                name={campo}
                value={empleado[campo]}
                onChange={handleChange}
                isInvalid={!!errores[campo]}
              />
              <Form.Control.Feedback type="invalid">
                {errores[campo]}
              </Form.Control.Feedback>
            </Form.Group>
          ))}
          <Button type="submit" variant="success">Actualizar</Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default ModalEditarEmpleado;