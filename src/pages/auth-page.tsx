import AuthForm from "@pages/auth/auth-form/auth-form.tsx";
import { useAuth } from "@context/auth-context.tsx";
import AuthAlert from "@pages/auth/auth-alert/auth-alert.tsx";
import { useState } from "react";
import clsx from "clsx";
import banner from "@assets/authimgs/banner-cell-phone-map-1.webp";
import { AuthMode } from "@/types";

const AuthPage = () => {
  const { errorMessage, clearError } = useAuth();
  const [mode, setMode] = useState<AuthMode>("login");
  const [isFormVisible, setIsFormVisible] = useState(true);
  const [, setIsSliding] = useState(false);

  const handleModeChange = (newMode: AuthMode) => {
    if (newMode === mode) return;
    setIsFormVisible(false);
    setTimeout(() => {
      setMode(newMode);
      setIsSliding(true);
    }, 300);
  };

  const handleSlideTransitionEnd = () => {
    setIsSliding(false);
    setTimeout(() => {
      setIsFormVisible(true);
    }, 400);
  };

  // MODIFICADO: Añadimos clases flex para centrar en LG
  return (
    <div className="relative w-screen h-screen bg-base overflow-hidden lg:flex lg:items-center lg:justify-center">
      {errorMessage && (
        <div className="absolute top-6 right-6 z-50">
          <AuthAlert message={errorMessage} onClose={clearError} />
        </div>
      )}

      {/* Formulario (posición) */}
      <div
        onTransitionEnd={handleSlideTransitionEnd}
        className={clsx(
          "absolute top-0 h-full flex items-center justify-center transition-all duration-500 z-10",
          "w-full lg:w-1/2",
          // 🔥 Aquí está el fix correcto:
          {
            "left-0": true, // móvil SIEMPRE a la izquierda
            "lg:left-0": mode === "login",
            "lg:left-1/2": mode === "register"
          }
        )}
      >

      {/* Formulario (opacidad separada) */}
        <div
          // MODIFICADO: Clases responsivas para el tamaño del formulario
          className={clsx(
            "flex items-center justify-center transition-opacity duration-300",
            // En móvil, el formulario es más ancho. En LG, más contenido.
            "w-11/12 md:w-3/4 lg:w-1/2",
            isFormVisible
              ? "opacity-100 pointer-events-auto"
              : "opacity-0 pointer-events-none"
          )}
        >
          <AuthForm mode={mode} onModeChange={handleModeChange} />

        </div>
      </div>

      {/* Banner */}
      <div
        // MODIFICADO: Ocultamos el banner en LG y mantenemos el slide en escritorio
        className={clsx(
          "absolute top-0 h-full w-1/2 items-center justify-center transition-all duration-500 z-10",
          // Oculto en LG y superior, visible como flex en pantallas menores
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
          {/* Botones alineados al lado del formulario */}
          <div
            className={clsx(
              "flex gap-4 transition-opacity duration-300",
              mode === "login" ? "justify-start" : "justify-end",
              isFormVisible
                ? "opacity-100"
                : "opacity-0 pointer-events-none"
            )}
          >
            <button
              onClick={() => handleModeChange("login")}
              className={clsx(
                "text-sm px-4 py-2 rounded-full transition-all ",
                mode === "login" ? "border" : " "
              )}
            >
              Inicia sesión
            </button>
            <button
              onClick={() => handleModeChange("register")}
              className={clsx(
                "text-sm px-4 py-2 rounded-full transition-all",
                mode === "register" ? "border" : " "
              )}
            >
              Regístrate ahora
            </button>
          </div>

          {/* Texto central fijo */}
          <div className="flex flex-col items-center justify-center mt-16 max-w-md">
            <h2 className="text-3xl font-bold leading-snug drop-shadow-md">
              Comparte experiencias,<br />
              crea rutas y organiza<br />
              eventos.
            </h2>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;