import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Button from "react-bootstrap/Button";
import ModalInstalacionIOS from "../components/inicio/ModalInstalacionIOS";

const Inicio = () => {
  const navigate = useNavigate();
  const deferredPrompt = useRef(null);
  const [isAppInstalled, setIsAppInstalled] = useState(false);

  // Detección mejorada de dispositivos iOS
  const [esDispositivoIOS, setEsDispositivoIOS] = useState(false);
  const [pwaInstallable, setPwaInstallable] = useState(false);

  // Navegación
  const handleNavigate = (path) => {
    navigate(path);
  };

  // Efecto para detectar iOS y capacidades PWA
  useEffect(() => {
    // Detección mejorada de iOS
    const isIOS = () => {
      return [
        'iPad Simulator',
        'iPhone Simulator',
        'iPod Simulator',
        'iPad',
        'iPhone',
        'iPod'
      ].includes(navigator.platform) ||
      (navigator.userAgent.includes("Mac") && "ontouchend" in document);
    };

    setEsDispositivoIOS(isIOS());

    // Manejar el evento de instalación PWA
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      deferredPrompt.current = e;
      setPwaInstallable(true);
    };

    // Verificar si la app ya está instalada
    const checkIfInstalled = () => {
      const isInstalled = window.matchMedia('(display-mode: standalone)').matches || 
                        window.navigator.standalone ||
                        document.referrer.includes('android-app://');
      setIsAppInstalled(isInstalled);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', () => setIsAppInstalled(true));
    
    checkIfInstalled();

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', () => setIsAppInstalled(true));
    };
  }, []);

  // Manejo de instalación PWA
  const handleInstallPWA = async () => {
    if (!deferredPrompt.current) {
      console.log("El evento de instalación no está disponible");
      return;
    }

    try {
      deferredPrompt.current.prompt();
      const { outcome } = await deferredPrompt.current.userChoice;
      
      if (outcome === 'accepted') {
        console.log('Usuario aceptó la instalación');
        setPwaInstallable(false);
      } else {
        console.log('Usuario rechazó la instalación');
      }
    } catch (error) {
      console.error('Error al instalar:', error);
    } finally {
      deferredPrompt.current = null;
    }
  };

  // Modal para iOS
  const [mostrarModalInstrucciones, setMostrarModalInstrucciones] = useState(false);
  const toggleModalInstrucciones = () => setMostrarModalInstrucciones(!mostrarModalInstrucciones);

  return (
    <div className="margen-superior-main">

      {/* Sección de instalación PWA */}
      <div className="mt-5">
        {/* Para dispositivos no iOS con soporte PWA */}
        {!esDispositivoIOS && pwaInstallable && !isAppInstalled && (
          <div className="text-center">
            <Button 
              variant="primary" 
              onClick={handleInstallPWA}
              className="shadow-sm"
            >
              <i className="bi bi-download me-2"></i>
              Instalar App Ferretería Duarte
            </Button>
            <p className="text-muted small mt-2">
              Instala esta aplicación en tu dispositivo para un acceso más rápido
            </p>
          </div>
        )}

        {/* Para dispositivos iOS */}
        {esDispositivoIOS && !isAppInstalled && (
          <div className="text-center">
            <Button 
              variant="info" 
              onClick={toggleModalInstrucciones}
              className="shadow-sm"
            >
              <i className="bi bi-phone me-2"></i>
              Cómo instalar en iPhone/iPad
            </Button>
            <ModalInstalacionIOS
              mostrar={mostrarModalInstrucciones}
              cerrar={toggleModalInstrucciones}
            />
          </div>
        )}

        {/* Mensaje si ya está instalado */}
        {isAppInstalled && (
          <div className="alert alert-success text-center">
            <i className="bi bi-check-circle-fill me-2"></i>
            La aplicación está instalada en tu dispositivo
          </div>
        )}
      </div>
    </div>
  );
};

export default Inicio;