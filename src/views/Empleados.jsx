import React, { useState } from "react";
import ModalRegistroEmpleado from "../components/empleados/ModalRegistroEmpleado";
import TablaEmpleados from "../components/empleados/TablaEmpleados";
import { Button, Container } from "react-bootstrap";

const Empleados = () => {
  const [showModal, setShowModal] = useState(false);
  const [empleados, setEmpleados] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const handleShow = () => setShowModal(true);
  const handleClose = () => setShowModal(false);

  const guardarEmpleado = (nuevoEmpleado) => {
    setEmpleados([...empleados, { id: Date.now(), ...nuevoEmpleado }]);
  };

  const empleadosPaginados = empleados.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <Container className="mt-4">
      <h2 className="text-center">Gestión de Empleados</h2>
      <div className="text-end mb-3">
        <Button variant="success" onClick={handleShow}>
          + Registrar Empleado
        </Button>
      </div>

      <TablaEmpleados
        empleados={empleadosPaginados}
        totalItems={empleados.length}
        itemsPerPage={itemsPerPage}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
      />

      <ModalRegistroEmpleado
        show={showModal}
        handleClose={handleClose}
        guardarEmpleado={guardarEmpleado}
      />
    </Container>
  );
};

export default Empleados;
