import React, { useEffect, useState } from "react";
import {
  collection,
  addDoc,
  onSnapshot,
  orderBy,
  query,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db } from "../../database/firebaseconfig";
import { Button, Form, ListGroup, Spinner, Modal } from "react-bootstrap";

const ChatIA = () => {
  const [mensaje, setMensaje] = useState("");
  const [mensajes, setMensajes] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [intencion, setIntencion] = useState(null);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState(null);
  const [showChatModal, setShowChatModal] = useState(false);

  const chatCollection = collection(db, "chat");
  const categoriasCollection = collection(db, "categorias");

  useEffect(() => {
    const q = query(chatCollection, orderBy("timestamp", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const mensajesObtenidos = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMensajes(mensajesObtenidos);
    });
    return () => unsubscribe();
  }, []);

  const obtenerCategorias = async () => {
    const snapshot = await getDocs(categoriasCollection);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  };

  const obtenerRespuestaIA = async (promptUsuario) => {
    const apiKey = import.meta.env.VITE_GOOGLE_AI_API_KEY;
    const prompt = `
      Analiza el mensaje del usuario: "${promptUsuario}".
      Determina la intención del usuario respecto a operaciones con categorías:
      - "crear"
      - "listar"
      - "actualizar"
      - "eliminar"
      Si se detecta una intención, extrae los datos relevantes: nombre y descripción de la categoría o índice/nombre para seleccionar.
      Devuelve una respuesta en formato JSON como:
      {
        "intencion": "crear",
        "datos": { "nombre": "nombre", "descripcion": "desc" },
        "seleccion": null
      }
    `;

    const response = await fetch("https://generativelanguage.googleapis.com/v1beta3/models/text-bison-001:generateText?key=" + apiKey, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt: { text: prompt },
        temperature: 0.3,
        candidateCount: 1,
      }),
    });

    const data = await response.json();
    try {
      const respuestaIA = JSON.parse(data.candidates[0].output);
      return respuestaIA;
    } catch (e) {
      return { intencion: "desconocida" };
    }
  };

  const enviarMensaje = async () => {
    if (!mensaje.trim()) return;
    const nuevoMensaje = { texto: mensaje, emisor: "usuario", timestamp: new Date() };
    setCargando(true);
    setMensaje("");
    try {
      await addDoc(chatCollection, nuevoMensaje);
      const respuestaIA = await obtenerRespuestaIA(mensaje);
      const categorias = await obtenerCategorias();

      if (respuestaIA.intencion === "listar") {
        if (categorias.length === 0) {
          await addDoc(chatCollection, { texto: "No hay categorías registradas.", emisor: "ia", timestamp: new Date() });
        } else {
          const lista = categorias.map((cat, i) => `${i + 1}. ${cat.nombre}: ${cat.descripcion}`).join("\n");
          await addDoc(chatCollection, { texto: `Categorías disponibles:\n${lista}`, emisor: "ia", timestamp: new Date() });
        }
      }

      if (respuestaIA.intencion === "crear") {
        const datos = respuestaIA.datos;
        if (datos?.nombre && datos?.descripcion) {
          await addDoc(categoriasCollection, datos);
          await addDoc(chatCollection, { texto: `Categoría "${datos.nombre}" registrada con éxito.`, emisor: "ia", timestamp: new Date() });
        } else {
          await addDoc(chatCollection, { texto: "No se pudo registrar la categoría. Faltan datos válidos.", emisor: "ia", timestamp: new Date() });
        }
      }

      if (respuestaIA.intencion === "eliminar") {
        if (categorias.length === 0) {
          await addDoc(chatCollection, { texto: "No hay categorías registradas para eliminar.", emisor: "ia", timestamp: new Date() });
          setIntencion(null);
        } else if (respuestaIA.seleccion) {
          const encontrada = categorias.find((cat, i) => cat.nombre.toLowerCase() === respuestaIA.seleccion.toLowerCase() || parseInt(respuestaIA.seleccion) === i + 1);
          if (encontrada) {
            await deleteDoc(doc(db, "categorias", encontrada.id));
            await addDoc(chatCollection, { texto: `Categoría "${encontrada.nombre}" eliminada con éxito.`, emisor: "ia", timestamp: new Date() });
            setIntencion(null);
          } else {
            await addDoc(chatCollection, { texto: "No se encontró la categoría especificada.", emisor: "ia", timestamp: new Date() });
          }
        } else {
          setIntencion("eliminar");
          const lista = categorias.map((cat, i) => `${i + 1}. ${cat.nombre}: ${cat.descripcion}`).join("\n");
          await addDoc(chatCollection, { texto: `Selecciona una categoría para eliminar:\n${lista}`, emisor: "ia", timestamp: new Date() });
        }
      }

      if (intencion === "eliminar" && respuestaIA.intencion === "seleccionar_categoria") {
        const encontrada = categorias.find((cat, i) => cat.nombre.toLowerCase() === mensaje.toLowerCase() || parseInt(mensaje) === i + 1);
        if (encontrada) {
          await deleteDoc(doc(db, "categorias", encontrada.id));
          await addDoc(chatCollection, { texto: `Categoría "${encontrada.nombre}" eliminada con éxito.`, emisor: "ia", timestamp: new Date() });
          setIntencion(null);
        } else {
          await addDoc(chatCollection, { texto: "Selección inválida. Intenta con un número o nombre válido.", emisor: "ia", timestamp: new Date() });
        }
      }

      if (respuestaIA.intencion === "actualizar") {
        if (categorias.length === 0) {
          await addDoc(chatCollection, { texto: "No hay categorías para actualizar.", emisor: "ia", timestamp: new Date() });
          setIntencion(null);
        } else if (respuestaIA.seleccion) {
          const encontrada = categorias.find((cat, i) => cat.nombre.toLowerCase() === respuestaIA.seleccion.toLowerCase() || parseInt(respuestaIA.seleccion) === i + 1);
          if (encontrada) {
            setCategoriaSeleccionada(encontrada);
            setIntencion("actualizar");
            await addDoc(chatCollection, { texto: `Seleccionaste "${encontrada.nombre}". Proporciona nuevos datos.`, emisor: "ia", timestamp: new Date() });
          } else {
            await addDoc(chatCollection, { texto: "Categoría no encontrada.", emisor: "ia", timestamp: new Date() });
          }
        } else {
          setIntencion("actualizar");
          const lista = categorias.map((cat, i) => `${i + 1}. ${cat.nombre}: ${cat.descripcion}`).join("\n");
          await addDoc(chatCollection, { texto: `Selecciona una categoría para actualizar:\n${lista}`, emisor: "ia", timestamp: new Date() });
        }
      }

      if (intencion === "actualizar" && categoriaSeleccionada && respuestaIA.intencion === "actualizar_datos") {
        const datos = respuestaIA.datos;
        const ref = doc(db, "categorias", categoriaSeleccionada.id);
        await updateDoc(ref, {
          nombre: datos.nombre || categoriaSeleccionada.nombre,
          descripcion: datos.descripcion || categoriaSeleccionada.descripcion,
        });
        await addDoc(chatCollection, { texto: `Categoría "${categoriaSeleccionada.nombre}" actualizada con éxito.`, emisor: "ia", timestamp: new Date() });
        setIntencion(null);
        setCategoriaSeleccionada(null);
      }

      if (respuestaIA.intencion === "desconocida") {
        await addDoc(chatCollection, { texto: "No entendí tu solicitud. Usa crear, listar, actualizar o eliminar.", emisor: "ia", timestamp: new Date() });
      }
    } catch (error) {
      console.error("Error al enviar mensaje:", error);
      await addDoc(chatCollection, { texto: "Ocurrió un error. Intenta más tarde.", emisor: "ia", timestamp: new Date() });
    } finally {
      setCargando(false);
    }
  };

  return (
    <div>
      <Button onClick={() => setShowChatModal(true)}>Abrir Chat</Button>
      <Modal show={showChatModal} onHide={() => setShowChatModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Chat con IA</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ListGroup>
            {mensajes.map((msg) => (
              <ListGroup.Item key={msg.id} variant={msg.emisor === "usuario" ? "primary" : "light"}>
                <strong>{msg.emisor === "usuario" ? "Tú" : "IA"}:</strong> {msg.texto}
              </ListGroup.Item>
            ))}
          </ListGroup>
          <Form className="mt-3" onSubmit={(e) => { e.preventDefault(); enviarMensaje(); }}>
            <Form.Control
              type="text"
              placeholder="Escribe tu mensaje..."
              value={mensaje}
              onChange={(e) => setMensaje(e.target.value)}
              disabled={cargando}
            />
            <Button type="submit" className="mt-2" disabled={cargando}>
              {cargando ? <Spinner animation="border" size="sm" /> : "Enviar"}
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default ChatIA;
