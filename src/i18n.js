import i18n from 'i18next';
import { initReactI18next, Translation } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { FcCallback } from 'react-icons/fc';

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        fallbackLng: 'es',
        interpolation: {
            escapeValue: false,
        },
        resources: {
            en: {
                translation: {
                    menu: {
                        inicio: "Home",
                        categorias: "Categories",
                        productos: "Products",
                        catalogo: "Catalog",
                        clima: "Weather",
                        pronunciacion: "Pronunciation",
                        estadisticas: "Stadistics",
                        empleados: "Employees",
                        cerrarSesion: "Logout",
                        iniciarSesion: "Login",
                        idioma: "Language",
                        español: "Spanish",
                        ingles: "English",
                    }
                }
            },
            es: {
                translation: {
                    menu: {
                        inicio: "Inicio",
                        categorias: "Categorias",
                        productos: "Productos",
                        catalogo: "Catálogo",
                        clima: "Clima",
                        pronunciacion: "Pronunciacición",
                        estadisticas: "Estadísticas",
                        empleados: "Empleados",
                        cerrarSesion: "Cerrar Sesión",
                        iniciarSesion: "Inicia Sesión",
                        idioma: "Idioma",
                        español: "Español",
                        ingles: "Inglés",
                    }
                }
            }
        },
    });

    export default i18n;