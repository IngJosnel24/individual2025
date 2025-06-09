import React, { useState, useEffect } from "react";
import { Container, Button, Col, Row } from "react-bootstrap";
import { db } from "../database/firebaseconfig";
import {
  collection,
  addDoc,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";

import ModalRegistroEmpleado from "../components/empleados/ModalRegistroEmpleado";
import ModalEditarEmpleado from "../components/empleados/ModalEdicionEmpleado";
import ModalEliminarEmpleado from "../components/empleados/ModalEliminacionEmpleado";
import TablaEmpleados from "../components/empleados/TablaEmpleados";
import CuadroBusquedas from "../components/busqueda/CuadrodeBusqueda";

const Empleados = () => {
  const [empleados, setEmpleados] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showModalEditar, setShowModalEditar] = useState(false);
  const [showModalEliminar, setShowModalEliminar] = useState(false);
  const [empleadoSeleccionado, setEmpleadoSeleccionado] = useState(null);

  const [nuevoEmpleado, setNuevoEmpleado] = useState({
    nombre: "",
    apellido: "",
    correo: "",
    telefono: "",
    cedula: "",
    contraseña: "",
    confirmarContraseña: "",
    fechaNacimiento: "",
    foto: null,
  });

  const [empleadosFiltrados, setEmpleadosFiltrados] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const empleadosCollection = collection(db, "empleados");

  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const fetchEmpleados = () => {
    const unsubscribe = onSnapshot(
      empleadosCollection,
      (snapshot) => {
        const fetchedEmpleados = snapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        }));
        setEmpleados(fetchedEmpleados);
        setEmpleadosFiltrados(fetchedEmpleados);
      },
      (error) => {
        console.error("Error al escuchar empleados:", error);
      }
    );
    return unsubscribe;
  };

  useEffect(() => {
    const cleanupListener = fetchEmpleados();
    return () => cleanupListener();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNuevoEmpleado((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setNuevoEmpleado((prev) => ({
      ...prev,
      foto: file,
    }));
  };

  const handleSearchChange = (e) => {
    const text = e.target.value.toLowerCase();
    setSearchText(text);
    const filtrados = empleados.filter(
      (empleado) =>
        empleado.nombre.toLowerCase().includes(text) ||
        empleado.apellido.toLowerCase().includes(text) ||
        empleado.correo.toLowerCase().includes(text)
    );
    setEmpleadosFiltrados(filtrados);
  };

  const handleAddEmpleado = async () => {
    setShowModal(false);
    const tempId = `temp_${Date.now()}`;
    const empleadoConId = { ...nuevoEmpleado, id: tempId };

    try {
      setEmpleados((prev) => [...prev, empleadoConId]);
      setEmpleadosFiltrados((prev) => [...prev, empleadoConId]);

      setNuevoEmpleado({
        nombre: "",
        apellido: "",
        correo: "",
        telefono: "",
        cedula: "",
        contraseña: "",
        confirmarContraseña: "",
        fechaNacimiento: "",
        foto: null,
      });

      await addDoc(empleadosCollection, {
        nombre: nuevoEmpleado.nombre,
        apellido: nuevoEmpleado.apellido,
        correo: nuevoEmpleado.correo,
        telefono: nuevoEmpleado.telefono,
        cedula: nuevoEmpleado.cedula,
        fechaNacimiento: nuevoEmpleado.fechaNacimiento,
      });
    } catch (error) {
      console.error("Error al agregar el empleado:", error);
    }
  };

  const handleEditarEmpleado = async (empleadoActualizado) => {
    try {
      const docRef = doc(db, "empleados", empleadoActualizado.id);
      await updateDoc(docRef, {
        nombre: empleadoActualizado.nombre,
        apellido: empleadoActualizado.apellido,
        correo: empleadoActualizado.correo,
        telefono: empleadoActualizado.telefono,
        cedula: empleadoActualizado.cedula,
        fechaNacimiento: empleadoActualizado.fechaNacimiento,
      });
      setShowModalEditar(false);
    } catch (error) {
      console.error("Error al editar empleado:", error);
    }
  };

  const handleEliminarEmpleado = async (empleado) => {
    try {
      const docRef = doc(db, "empleados", empleado.id);
      await deleteDoc(docRef);
      setShowModalEliminar(false);
    } catch (error) {
      console.error("Error al eliminar empleado:", error);
    }
  };

  const paginatedEmpleados = empleadosFiltrados.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <Container className="mt-5">
      <h4>Gestión de Empleados</h4>
      <Row>
        <Col lg={3} md={4} sm={4} xs={5}>
          <Button
            className="mb-3"
            onClick={() => setShowModal(true)}
            style={{ width: "100%" }}
          >
            Agregar empleado
          </Button>
        </Col>
        <Col lg={5} md={8} sm={8} xs={7}>
          <CuadroBusquedas
            searchText={searchText}
            handleSearchChange={handleSearchChange}
          />
        </Col>
      </Row>

      <TablaEmpleados
        empleados={paginatedEmpleados}
        totalItems={empleadosFiltrados.length}
        itemsPerPage={itemsPerPage}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        onEditar={(empleado) => {
          setEmpleadoSeleccionado(empleado);
          setShowModalEditar(true);
        }}
        onEliminar={(empleado) => {
          setEmpleadoSeleccionado(empleado);
          setShowModalEliminar(true);
        }}
      />

      <ModalRegistroEmpleado
        showModal={showModal}
        setShowModal={setShowModal}
        nuevoEmpleado={nuevoEmpleado}
        handleInputChange={handleInputChange}
        handleFileChange={handleFileChange}
        handleAddEmpleado={handleAddEmpleado}
      />

      <ModalEditarEmpleado
        show={showModalEditar}
        onHide={() => setShowModalEditar(false)}
        empleado={empleadoSeleccionado}
        onEditar={handleEditarEmpleado}
      />

      <ModalEliminarEmpleado
        show={showModalEliminar}
        onHide={() => setShowModalEliminar(false)}
        empleado={empleadoSeleccionado}
        onEliminar={handleEliminarEmpleado}
      />
    </Container>
  );
};

export default Empleados;