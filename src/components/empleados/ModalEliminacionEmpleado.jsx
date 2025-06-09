import React from "react";
import { Modal, Button } from "react-bootstrap";

const ModalEliminarEmpleado = ({ show, onHide, empleado, handleEliminar }) => {
  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Eliminar Empleado</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        ¿Estás seguro que deseas eliminar a <strong>{empleado?.nombre} {empleado?.apellido}</strong>?
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>Cancelar</Button>
        <Button variant="danger" onClick={() => {
          handleEliminar(empleado.id);
          onHide();
        }}>
          Eliminar
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalEliminarEmpleado;