import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./database/authcontext";
import ProtectedRoute from "../src/components/ProtectedRoute"; 
import Login from '../src/views/Login'
import Encabezado from "../src/components/Encabezado";
import Inicio from "../src/views/Inicio";
import Categorias from "../src/views/categorias"; //Importación de Categorias
import Productos from "../src/views/productos";
import Catalogo from "../src/views/catalogo";
import Pronunciacion from "./views/Pronunciacion";
import Clima from "./views/Clima";

import './App.css'

function App() {

  return (
    <>
      <AuthProvider>
        <Router>
            <Encabezado />
            <main>
              <Routes>
                
                <Route path="/" element={<Login />} />
                <Route path="/inicio" element={<ProtectedRoute element={<Inicio />} />} />
                <Route path="/categorias" element={<ProtectedRoute element={<Categorias />} />}/> //Ruta de Categorias protegida
                <Route path="/productos" element={<ProtectedRoute element={<Productos />} />}/>
                <Route path="/pronunciacion" element={<ProtectedRoute element={<Pronunciacion />} />}/>
                <Route path="/catalogo" element={<ProtectedRoute element={<Catalogo />} />}/>
                <Route path="/clima" element={<ProtectedRoute element={<Clima />} />}/>

              </Routes>
            </main>
        </Router>
      </AuthProvider>
    </>
  )
}

export default App;