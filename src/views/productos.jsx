// Importaciones
import React, { useState, useEffect } from "react";
import { Container, Button, Col, Row } from "react-bootstrap";
import { db } from "../database/firebaseconfig";
import QRCode from "react-qr-code";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  onSnapshot,
  deleteDoc,
} from "firebase/firestore";
import TablaProductos from "../components/productos/tablaProductos";
import ModalRegistroProducto from "../components/productos/modalRegistroProducto";
import ModalEdicionProducto from "../components/productos/modalEdicionProducto";
import ModalEliminacionProducto from "../components/productos/modalEliminacionProducto";
import Paginacion from "../components/ordenamiento/Paginacion";
import ModalQR from "../components/qr/modalQR";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

const Productos = () => {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [nuevoProducto, setNuevoProducto] = useState({
    nombre: "",
    precio: "",
    categoria: "",
    imagen: "",
  });
  const [productoEditado, setProductoEditado] = useState(null);
  const [productoAEliminar, setProductoAEliminar] = useState(null);
  const [showQRModal, setShowQRModal] = useState(false);
  const [selectedUrl, setSelectedUrl] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const productosCollection = collection(db, "productos");
  const categoriasCollection = collection(db, "categorias");

  const openQRModal = (url) => {
    setSelectedUrl(url);
    setShowQRModal(true);
  };

  const handleCloseQRModal = () => {
    setShowQRModal(false);
    setSelectedUrl("");
  };

  const fetchData = () => {
    const unsubscribeProductos = onSnapshot(
      productosCollection,
      (snapshot) => {
        const fetchedProductos = snapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        }));
        setProductos(fetchedProductos);
      },
      (error) => alert("Error al cargar productos: " + error.message)
    );

    const unsubscribeCategorias = onSnapshot(
      categoriasCollection,
      (snapshot) => {
        const fetchedCategorias = snapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        }));
        setCategorias(fetchedCategorias);
      },
      (error) => alert("Error al cargar categorías: " + error.message)
    );

    return () => {
      unsubscribeProductos();
      unsubscribeCategorias();
    };
  };

  useEffect(() => {
    const unsubscribe = fetchData();
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNuevoProducto((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setProductoEditado((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNuevoProducto((prev) => ({ ...prev, imagen: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEditImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProductoEditado((prev) => ({ ...prev, imagen: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddProducto = async () => {
    if (!nuevoProducto.nombre || !nuevoProducto.precio || !nuevoProducto.categoria) {
      alert("Por favor, completa todos los campos requeridos.");
      return;
    }
    try {
      await addDoc(productosCollection, nuevoProducto);
      setShowModal(false);
      setNuevoProducto({ nombre: "", precio: "", categoria: "", imagen: "" });
    } catch (error) {
      alert("Error al agregar producto: " + error.message);
    }
  };

  const handleEditProducto = async () => {
    if (
      !productoEditado.nombre ||
      !productoEditado.precio ||
      !productoEditado.categoria ||
      !productoEditado.imagen
    ) {
      alert("Por favor, completa todos los campos, incluyendo la imagen.");
      return;
    }
    const productoRef = doc(db, "productos", productoEditado.id);
    try {
      await updateDoc(productoRef, {
        nombre: productoEditado.nombre,
        precio: parseFloat(productoEditado.precio),
        categoria: productoEditado.categoria,
        imagen: productoEditado.imagen,
      });
      setShowEditModal(false);
    } catch (error) {
      alert("Error al actualizar producto: " + error.message);
    }
  };

  const openEditModal = (producto) => {
    setProductoEditado({ ...producto });
    setShowEditModal(true);
  };

  const openDeleteModal = (producto) => {
    setProductoAEliminar(producto);
    setShowDeleteModal(true);
  };

  const handleDeleteProducto = async () => {
    if (!productoAEliminar) return;
    try {
      const productoRef = doc(db, "productos", productoAEliminar.id);
      await deleteDoc(productoRef);
      setShowDeleteModal(false);
      setProductoAEliminar(null);
    } catch (error) {
      alert("Error al eliminar el producto: " + error.message);
    }
  };

  const handleCopy = (producto) => {
    const rowData = `Nombre: ${producto.nombre}\nPrecio: C$${producto.precio}\nCategoría: ${producto.categoria}`;
    navigator.clipboard
      .writeText(rowData)
      .then(() => alert("Datos copiados al portapapeles"))
      .catch((err) => alert("Error al copiar: " + err));
  };

  const paginatedProductos = productos.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const generarPDFProductos = () => {
    const doc = new jsPDF();
    doc.setFillColor(28, 51, 51);
    doc.rect(0, 0, 220, 30, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.text("Lista de Productos", doc.internal.pageSize.getWidth() / 2, 18, { align: "center" });

    const columnas = ["#", "Nombre", "Precio", "Categoría"];
    const filas = productos.map((producto, index) => [
      index + 1,
      producto.nombre,
      `C$ ${producto.precio}`,
      producto.categoria,
    ]);

    autoTable(doc, {
      head: [columnas],
      body: filas,
      startY: 40,
      theme: "grid",
      styles: { fontSize: 10, cellPadding: 2 },
      margin: { top: 20, left: 14, right: 14 },
      didDrawPage: function () {
        const pageHeight = doc.internal.pageSize.getHeight();
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageNumber = doc.internal.getNumberOfPages();
        const totalPagesExp = "{total_pages_count_string}";
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        doc.text(`Página ${pageNumber} de ${totalPagesExp}`, pageWidth / 2, pageHeight - 10, {
          align: "center",
        });
      },
    });

    if (typeof doc.putTotalPages === "function") {
      doc.putTotalPages("{total_pages_count_string}");
    }

    const fecha = new Date();
    const nombreArchivo = `productos_${fecha.getDate()}${fecha.getMonth() + 1}${fecha.getFullYear()}.pdf`;
    doc.save(nombreArchivo);
  };

  const exportarExcelProductos = () => {
    const datos = productos.map((producto, index) => ({
      "#": index + 1,
      Nombre: producto.nombre,
      Precio: producto.precio,
      Categoría: producto.categoria,
    }));

    const hoja = XLSX.utils.json_to_sheet(datos);
    const libro = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(libro, hoja, "Productos");

    const fecha = new Date();
    const nombreArchivo = `productos_${fecha.getDate()}${fecha.getMonth() + 1}${fecha.getFullYear()}.xlsx`;

    XLSX.writeFile(libro, nombreArchivo);
  };

  const generarPDFDetalleProducto = (producto) => {
    const doc = new jsPDF();
    doc.setFillColor(40, 60, 80);
    doc.rect(0, 0, 220, 30, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.text("Detalle del Producto", doc.internal.pageSize.getWidth() / 2, 18, { align: "center" });

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.text(`Nombre: ${producto.nombre}`, 20, 50);
    doc.text(`Precio: C$ ${producto.precio}`, 20, 60);
    doc.text(`Categoría: ${producto.categoria}`, 20, 70);

    if (producto.imagen) {
      try {
        doc.addImage(producto.imagen, "JPEG", 20, 80, 60, 60);
      } catch (error) {
        doc.text("No se pudo cargar la imagen.", 20, 85);
      }
    } else {
      doc.text("Este producto no tiene imagen asociada.", 20, 85);
    }

    const fecha = new Date();
    const nombreArchivo = `detalle_producto_${producto.nombre}_${fecha.getDate()}${fecha.getMonth() + 1}${fecha.getFullYear()}.pdf`;

    doc.save(nombreArchivo);
  };

  return (
    <Container className="mt-5">
      <h4>Gestión de Productos</h4>
      <Row className="mb-3">
        <Col lg={3}>
          <Button onClick={() => setShowModal(true)}>Agregar producto</Button>
        </Col>
        <Col lg={3}>
          <Button variant="secondary" onClick={generarPDFProductos} style={{ width: "100%" }}>
            Generar reporte PDF
          </Button>
        </Col>
        <Col lg={3}>
          <Button variant="success" onClick={exportarExcelProductos} style={{ width: "100%" }}>
            Generar Excel
          </Button>
        </Col>
      </Row>

      <TablaProductos
        productos={paginatedProductos}
        openEditModal={openEditModal}
        openDeleteModal={openDeleteModal}
        handleCopy={handleCopy}
        openQRModal={openQRModal}
        generarPDFDetalleProducto={generarPDFDetalleProducto}
      />
      <ModalQR show={showQRModal} handleClose={handleCloseQRModal} url={selectedUrl} />
      <Paginacion
        itemsPerPage={itemsPerPage}
        totalItems={productos.length}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
      />
      <ModalRegistroProducto
        showModal={showModal}
        setShowModal={setShowModal}
        nuevoProducto={nuevoProducto}
        handleInputChange={handleInputChange}
        handleImageChange={handleImageChange}
        handleAddProducto={handleAddProducto}
        categorias={categorias}
      />
      <ModalEdicionProducto
        showEditModal={showEditModal}
        setShowEditModal={setShowEditModal}
        productoEditado={productoEditado}
        handleEditInputChange={handleEditInputChange}
        handleEditImageChange={handleEditImageChange}
        handleEditProducto={handleEditProducto}
        categorias={categorias}
      />
      <ModalEliminacionProducto
        showDeleteModal={showDeleteModal}
        setShowDeleteModal={setShowDeleteModal}
        handleDeleteProducto={handleDeleteProducto}
      />
    </Container>
  );
};

export default Productos;
