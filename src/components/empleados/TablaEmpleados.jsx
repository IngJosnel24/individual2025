import React from "react";
import { Table, Button } from "react-bootstrap";
import Pagination from "../ordenamiento/Paginacion";
import { Zoom } from "react-awesome-reveal";

const TablaEmpleados = ({
  empleados,
  onEditar,
  onEliminar,
  itemsPerPage,
  totalItems,
  currentPage,
  setCurrentPage,
}) => {
  return (
    <Zoom cascade damping={0.1} triggerOnce>
      <div className="table-responsive">
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>#</th>
              <th>Nombre</th>
              <th>Apellido</th>
              <th>Correo</th>
              <th>Teléfono</th>
              <th>Cédula</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {empleados.map((empleado, index) => (
              <tr key={empleado.id}>
                <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                <td>{empleado.nombre}</td>
                <td>{empleado.apellido}</td>
                <td>{empleado.correo}</td>
                <td>{empleado.telefono}</td>
                <td>{empleado.cedula}</td>
                <td>
                  <Button
                    variant="info"
                    size="sm"
                    onClick={() => onEditar(empleado)}
                    className="me-2"
                  >
                    Editar
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => onEliminar(empleado)}
                  >
                    Eliminar
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>

      <Pagination
        itemsPerPage={itemsPerPage}
        totalItems={totalItems}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
      />
    </Zoom>
  );
};

export default TablaEmpleados;