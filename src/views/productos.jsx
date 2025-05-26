// Importaciones
import React, { useState, useEffect } from "react";
import { Container, Button } from "react-bootstrap";
import { db } from "../database/firebaseconfig";
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

const Productos = () => {
  // Estados
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

  // Estado para paginación
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Referencias
  const productosCollection = collection(db, "productos");
  const categoriasCollection = collection(db, "categorias");

  // Obtener productos y categorías
  const fetchData = () => {
    // Escuchar productos
    const unsubscribeProductos = onSnapshot(
      productosCollection,
      (snapshot) => {
        const fetchedProductos = snapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        }));
        setProductos(fetchedProductos);
      },
      (error) => {
        console.error("Error al escuchar productos:", error);
        alert("Error al cargar productos: " + error.message);
      }
    );

    // Escuchar categorías
    const unsubscribeCategorias = onSnapshot(
      categoriasCollection,
      (snapshot) => {
        const fetchedCategorias = snapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        }));
        setCategorias(fetchedCategorias);
      },
      (error) => {
        console.error("Error al escuchar categorías:", error);
        alert("Error al cargar categorías: " + error.message);
      }
    );


    return () => {
      unsubscribeProductos();
      unsubscribeCategorias();
    };
  };

  // useEffect para cargar datos al montar el componente
  useEffect(() => {
    const unsubscribe = fetchData();
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // Manejadores de inputs
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
    if (
      !nuevoProducto.nombre ||
      !nuevoProducto.precio ||
      !nuevoProducto.categoria
    ) {
      alert("Por favor, completa todos los campos requeridos.");
      return;
    }
    try {
      await addDoc(productosCollection, nuevoProducto);
      setShowModal(false);
      setNuevoProducto({ nombre: "", precio: "", categoria: "", imagen: "" });
    } catch (error) {
      console.error("Error al agregar producto:", error);
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

    setShowEditModal(false);

    const productoRef = doc(db, "productos", productoEditado.id);

    try {
      await updateDoc(productoRef, {
        nombre: productoEditado.nombre,
        precio: parseFloat(productoEditado.precio),
        categoria: productoEditado.categoria,
        imagen: productoEditado.imagen,
      });
    } catch (error) {
      console.error("Error al actualizar el producto:", error);
      alert("Error al actualizar el producto: " + error.message);
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
    if (!productoAEliminar) {
      alert("No se ha seleccionado un producto para eliminar.");
      return;
    }
  
    try {
      const productoRef = doc(db, "productos", productoAEliminar.id);
      await deleteDoc(productoRef);
  
      setShowDeleteModal(false);  // Cierra el modal después de eliminar
      setProductoAEliminar(null); // Limpia el producto seleccionado
    } catch (error) {
      console.error("Error al eliminar el producto:", error);
      alert("Error al eliminar el producto: " + error.message);
    }
  };

      // Método para copiar datos al portapapeles
    const handleCopy = (producto) => {
      const rowData = `Nombre: ${producto.nombre}\nPrecio: C$${producto.precio}\nCategoría: ${producto.categoria}`;

      navigator.clipboard
        .writeText(rowData)
        .then(() => {
          console.log("Datos de la fila copiados al portapapeles:\n" + rowData);
        })
        .catch((err) => {
          console.error("Error al copiar al portapapeles:", err);
        });
    };
  
  // Lógica de paginación
  const paginatedProductos = productos.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <Container className="mt-5">
      <br />
      <h4>Gestión de Productos</h4>
      <Button className="mb-3" onClick={() => setShowModal(true)}>
        Agregar producto
      </Button>
      


      {/* Tabla con productos paginados */}
      <TablaProductos
        productos={paginatedProductos}
        openEditModal={openEditModal}
        openDeleteModal={openDeleteModal}
        handleCopy={handleCopy}
      />
      

      {/* Componente de paginación */}
      <Paginacion
        itemsPerPage={itemsPerPage}
        totalItems={productos.length}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
      />

      

      {/* Modales */}
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
