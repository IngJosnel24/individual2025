import React from "react";
import { Table, Button, Image } from "react-bootstrap";
import "bootstrap-icons/font/bootstrap-icons.css";

const TablaProductos = ({ 
  productos, 
  openEditModal, 
  openDeleteModal,
  openQRModal,
  handleCopy  
}) => {
  return (
    <Table striped bordered hover responsive>
      <thead>
        <tr>
          <th>Imagen</th>
          <th>Nombre</th>
          <th>Precio</th>
          <th>Categoría</th>
          <th>PDF</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        {productos.map((producto) => (
          <tr key={producto.id}>
            <td>
              {producto.imagen && (
                <Image src={producto.imagen} width="50" height="50" />
              )}
            </td>
            <td>{producto.nombre}</td>
            <td>C${producto.precio}</td>
            <td>{producto.categoria}</td>
           <td className="d-flex flex-column align-items-start">
  {producto.pdfUrl ? (
    <>
      <a href={producto.pdfUrl} target="_blank" rel="noopener noreferrer" className="mb-1">
        Ver PDF
      </a>
      <Button
        variant="outline-dark"
        size="sm"
        onClick={() => {
          console.log("URL del PDF:", producto.pdfUrl);
          openQRModal(producto.pdfUrl);
        }}
      >
        <i className="bi bi-qr-code"></i> QR
      </Button>
    </>
  ) : (
    <span className="text-muted">No disponible</span>
  )}
</td>


            <td>
               
              <Button
                variant="outline-warning"
                size="sm"
                className="me-2"
                onClick={() => openEditModal(producto)}
              >
                <i className="bi bi-pencil"></i>
              </Button>
              <Button
                variant="outline-danger"
                size="sm"
                onClick={() => openDeleteModal(producto)}
              >
                <i className="bi bi-trash"></i>
              </Button>
              <Button
                variant="outline-info"
                size="sm"
                onClick={() => handleCopy(producto)}
                className="me-2"
              >
                <i className="bi bi-clipboard"></i>
              </Button>
              
    
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
};

export default TablaProductos;