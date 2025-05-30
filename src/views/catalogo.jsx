import React, { useState, useEffect } from "react";
import { Container, Row, Form, Col } from "react-bootstrap";
import { db } from "../database/firebaseconfig";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import TarjetaProducto from "../components/catalogo/TarjetaProducto";
import ModalEdicionProducto from "../components/productos/modalEdicionProducto";
import CuadrodeBusqueda from "../components/busqueda/CuadrodeBusqueda"; // Asegúrate que esta ruta sea correcta
import { FaSearch } from "react-icons/fa";
const Catalogo = () => {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState("Todas");
  const [busqueda, setBusqueda] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);
  const [productoEditado, setProductoEditado] = useState(null);

  const productosCollection = collection(db, "productos");
  const categoriasCollection = collection(db, "categorias");

  const fetchData = async () => {
    try {
      const productosData = await getDocs(productosCollection);
      setProductos(productosData.docs.map(doc => ({ ...doc.data(), id: doc.id })));

      const categoriasData = await getDocs(categoriasCollection);
      setCategorias(categoriasData.docs.map(doc => ({ ...doc.data(), id: doc.id })));
    } catch (error) {
      console.error("Error al obtener datos:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openEditModal = (producto) => {
    setProductoEditado({ ...producto });
    setShowEditModal(true);
  };

  const handleEditInputChange = (e) => {
    setProductoEditado({ ...productoEditado, [e.target.name]: e.target.value });
  };

  const handleEditImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProductoEditado({ ...productoEditado, imagen: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEditProducto = async () => {
    if (!productoEditado.nombre || !productoEditado.precio || !productoEditado.categoria) {
      alert("Todos los campos son obligatorios");
      return;
    }
    try {
      const productoRef = doc(db, "productos", productoEditado.id);
      await updateDoc(productoRef, productoEditado);
      setShowEditModal(false);
      fetchData();
    } catch (error) {
      console.error("Error al actualizar el producto:", error);
    }
  };

  // 🔍 Filtrado por categoría y búsqueda
  const productosFiltrados = productos.filter((producto) => {
    const coincideCategoria = categoriaSeleccionada === "Todas" || producto.categoria === categoriaSeleccionada;
    const coincideBusqueda =
      producto.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      producto.categoria.toLowerCase().includes(busqueda.toLowerCase());
    return coincideCategoria && coincideBusqueda;
  });

  return (
    <Container className="mt-5">
      <h4>Catálogo de Productos</h4>
      <Row className="mb-3">
        <Col lg={3} md={4} sm={6}>
          <Form.Group>
            <Form.Label>Filtrar por categoría:</Form.Label>
            <Form.Select value={categoriaSeleccionada} onChange={(e) => setCategoriaSeleccionada(e.target.value)}>
              <option value="Todas">Todas</option>
              {categorias.map(categoria => (
                <option key={categoria.id} value={categoria.nombre}>{categoria.nombre}</option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>
        <Col lg={4} md={6} sm={12}>
        <Form.Label>
    <FaSearch className="me-2" /> {/* Ícono de búsqueda */}
  </Form.Label>
  <CuadrodeBusqueda valorBusqueda={busqueda} onCambio={setBusqueda} />
        </Col>
      </Row>

      <Row>
        {productosFiltrados.length > 0 ? (
          productosFiltrados.map(producto => (
            <TarjetaProducto key={producto.id} producto={producto} openEditModal={openEditModal} />
          ))
        ) : (
          <p>No hay productos que coincidan con la búsqueda.</p>
        )}
      </Row>

      <ModalEdicionProducto
        showEditModal={showEditModal}
        setShowEditModal={setShowEditModal}
        productoEditado={productoEditado}
        handleEditInputChange={handleEditInputChange}
        handleEditImageChange={handleEditImageChange}
        handleEditProducto={handleEditProducto}
        categorias={categorias}
      />
    </Container>
  );
};

export default Catalogo;
