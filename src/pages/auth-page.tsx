import AuthForm from "@components/auth/auth-form/auth-form.tsx";
import { useAuth } from "@context/auth-context.tsx";
import AuthAlert from "@components/auth/auth-alert/auth-alert.tsx";
import { useState } from "react";
import clsx from "clsx";
import banner from "@assets/authimgs/banner-cell-phone-map-1.webp";
import { AuthMode } from "@/types";

const AuthPage = () => {
  const { errorMessage, clearError } = useAuth();

  const [mode, setMode] = useState<AuthMode>("login");
  const [isFormVisible, setIsFormVisible] = useState(true);
  const [isSliding, setIsSliding] = useState(false);

  const handleModeChange = (newMode: AuthMode) => {
    if (newMode === mode) return;

    // Fase 1: Ocultar opacidad
    setIsFormVisible(false);

    // Fase 2: Cambio de modo + activación del slide tras fundido
    setTimeout(() => {
      setMode(newMode);
      setIsSliding(true);
    }, 300); // ⚠️ Coincide con duración de opacidad-out
  };

  const handleSlideTransitionEnd = () => {
    // Fase 3: el slide ha terminado, esperamos un pelín antes de mostrar
    setIsSliding(false);
    setTimeout(() => {
      setIsFormVisible(true);
    }, 400); // ✅ margen de seguridad para que no aparezca en el último frame del slide
  };


  return (
    <div className="relative w-screen h-screen bg-base overflow-hidden">
      {errorMessage && (
        <div className="absolute top-6 right-6 z-50">
          <AuthAlert message={errorMessage} onClose={clearError} />
        </div>
      )}

      {/* Formulario (posición) */}
      <div
        onTransitionEnd={handleSlideTransitionEnd}
        className={clsx(
          "absolute top-0 h-full w-1/2 flex items-center justify-center transition-all duration-500 z-10",
          mode === "login" ? "left-1/2" : "left-0"
        )}
      >
        {/* Formulario (opacidad separada) */}
        <div
          className={clsx(
            "w-1/2 flex items-center justify-center transition-opacity duration-300",
            isFormVisible ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          )}
        >
          <AuthForm mode={mode} />
        </div>
      </div>


      {/* Banner */}
      <div
        className={clsx(
          "absolute top-0 h-full w-1/2 flex items-center justify-center transition-all duration-500 z-10",
          mode === "login" ? "left-0" : "left-1/2"
        )}
      >
        <div
          className="w-[95%] h-[95%] rounded-2xl relative overflow-hidden flex flex-col justify-between px-8 py-6 text-white shadow-lg"
          style={{
            backgroundImage: `url(${banner})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >

          {/* Botones alineados al lado del formulario */}
          <div
            className={clsx(
              "flex gap-4",
              mode === "login" ? "justify-end" : "justify-start"
            )}
          >

          <button
              onClick={() => handleModeChange("login")}
              className={clsx(
                "text-sm px-4 py-2  rounded-full transition-all duration-300",
                mode === "login"
                  ? " border "
                  : " "
              )}
            >
              Inicia sesión
            </button>

            <button
              onClick={() => handleModeChange("register")}
              className={clsx(
                "text-sm px-4 py-2  rounded-full transition-all duration-300",
                mode === "register"
                  ? "border"
                  : " "
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
