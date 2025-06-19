/**
 * Componente principal de autenticación que maneja el login y registro
 * Implementa un diseño responsivo con animaciones suaves y transiciones
 * entre los modos de login y registro.
 * 
 * Características principales:
 * - Diseño dividido en dos secciones (formulario y banner)
 * - Animaciones de transición suaves
 * - Diseño responsivo optimizado para móvil y desktop
 * - Manejo de estados de autenticación
 * - Sistema de alertas para errores
 */

import AuthForm from "@pages/auth/auth-form/auth-form.tsx";
import { useAuth } from "@context/auth-context.tsx";
import AuthAlert from "@pages/auth/auth-alert/auth-alert.tsx";
import { useState, useCallback, memo } from "react";
import clsx from "clsx";
import banner from "@assets/authimgs/banner-cell-phone-map-1.webp";
import { AuthMode } from "@/types";

/**
 * Componente Banner memoizado que muestra la sección derecha de la página
 * Contiene la imagen de fondo, botones de navegación y texto promocional
 * 
 * @param mode - Modo actual de autenticación ('login' | 'register')
 * @param isFormVisible - Estado de visibilidad del formulario
 * @param onModeChange - Función para cambiar entre modos
 */
const Banner = memo(({ mode, isFormVisible, onModeChange }: {
  mode: AuthMode;
  isFormVisible: boolean;
  onModeChange: (mode: AuthMode) => void;
}) => (
  <div
    className={clsx(
      "absolute top-0 h-full w-1/2 items-center justify-center transition-all duration-500 z-10",
      "hidden lg:flex",
      mode === "login" ? "left-1/2" : "left-0"
    )}
  >
    <div
      className="w-full h-full relative overflow-hidden flex flex-col justify-between px-8 py-6 text-white shadow-lg"
      style={{
        backgroundImage: `url(${banner})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Botones de navegación entre modos */}
      <div
        className={clsx(
          "flex gap-4 transition-opacity duration-300",
          mode === "login" ? "justify-start" : "justify-end",
          isFormVisible ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
      >
        <button
          onClick={() => onModeChange("login")}
          className={clsx(
            "text-sm px-4 py-2 rounded-full transition-all hover:bg-white/10",
            mode === "login" ? "border" : ""
          )}
          aria-pressed={mode === "login"}
        >
          Inicia sesión
        </button>
        <button
          onClick={() => onModeChange("register")}
          className={clsx(
            "text-sm px-4 py-2 rounded-full transition-all hover:bg-white/10",
            mode === "register" ? "border" : ""
          )}
          aria-pressed={mode === "register"}
        >
          Regístrate ahora
        </button>
      </div>

      {/* Texto promocional */}
      <div className="flex flex-col items-center justify-center mt-16 max-w-md">
        <h2 className="text-3xl font-bold leading-snug drop-shadow-md">
          Comparte experiencias,<br />
          crea rutas y organiza<br />
          eventos.
        </h2>
      </div>
    </div>
  </div>
));

Banner.displayName = 'Banner';

/**
 * Componente principal de la página de autenticación
 * Maneja la lógica de cambio entre modos y las animaciones
 */
const AuthPage = () => {
  // Estados y contexto
  const { errorMessage, clearError } = useAuth();
  const [mode, setMode] = useState<AuthMode>("login");
  const [isFormVisible, setIsFormVisible] = useState(true);
  const [isSliding, setIsSliding] = useState(false);

  /**
   * Maneja el cambio entre modos de autenticación
   * Implementa una animación de transición suave
   */
  const handleModeChange = useCallback((newMode: AuthMode) => {
    if (newMode === mode) return;
    setIsFormVisible(false);
    setTimeout(() => {
      setMode(newMode);
      setIsSliding(true);
    }, 300);
  }, [mode]);

  /**
   * Maneja el final de la transición del slide
   * Restaura la visibilidad del formulario
   */
  const handleSlideTransitionEnd = useCallback(() => {
    setIsSliding(false);
    setTimeout(() => {
      setIsFormVisible(true);
    }, 400);
  }, []);

  return (
    <div 
      className="relative w-screen h-screen bg-base overflow-hidden lg:flex lg:items-center lg:justify-center"
      role="main"
      aria-label="Página de autenticación"
    >
      {/* Alerta de error */}
      {errorMessage && (
        <div className="absolute top-6 right-6 z-50">
          <AuthAlert message={errorMessage} onClose={clearError} />
        </div>
      )}

      {/* Contenedor del formulario con animaciones */}
      <div
        onTransitionEnd={handleSlideTransitionEnd}
        className={clsx(
          "absolute top-0 h-full flex items-center justify-center transition-all duration-500 z-10",
          "w-full lg:w-1/2",
          {
            "left-0": true,
            "lg:left-0": mode === "login",
            "lg:left-1/2": mode === "register"
          }
        )}
      >
        <div
          className={clsx(
            "flex items-center justify-center transition-opacity duration-300",
            "w-[95%] sm:w-11/12 md:w-3/4 lg:w-1/2",
            "px-2 sm:px-4",
            isFormVisible
              ? "opacity-100 pointer-events-auto"
              : "opacity-0 pointer-events-none"
          )}
        >
          <AuthForm mode={mode} onModeChange={handleModeChange} />
        </div>
      </div>

      {/* Banner lateral */}
      <Banner 
        mode={mode}
        isFormVisible={isFormVisible}
        onModeChange={handleModeChange}
      />
    </div>
  );
};

// Exportamos el componente memoizado para optimizar el rendimiento
const AuthPageComponent = memo(AuthPage);
export default AuthPageComponent; 