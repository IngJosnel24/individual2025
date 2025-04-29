import { useNavigate } from "react-router-dom";

const Inicio = () => {
    const navigate = useNavigate();

    // Función de navegación
    const handleNavigate = (path) => {
      navigate(path);
    };

 
}

export default Inicio;