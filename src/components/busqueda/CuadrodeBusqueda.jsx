// src/componentes/busqueda/CuadrodeBusqueda.jsx
const CuadrodeBusqueda = ({ valorBusqueda, onCambio }) => {
    return (
      <input
        type="text"
        placeholder="Buscar..."
        value={valorBusqueda}
        onChange={(e) => onCambio(e.target.value)}
        className="p-2 border border-gray-300 rounded w-full max-w-md mb-4"
      />
    );
  };
  
  export default CuadrodeBusqueda;
  