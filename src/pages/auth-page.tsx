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
          className="w-[95%] h-[95%] rounded-2xl relative flex items-center justify-center text-white text-xl font-bold shadow-lg"
          style={{
            backgroundImage: `url(${banner})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          {/* Botón login */}
          <button
            onClick={() => handleModeChange("login")}
            className="absolute left-4 bottom-6 bg-black text-white px-4 py-2 rounded"
          >
            Mostrar login
          </button>

          {/* Botón registro */}
          <button
            onClick={() => handleModeChange("register")}
            className="absolute right-4 bottom-6 bg-black text-white px-4 py-2 rounded"
          >
            Mostrar registro
          </button>

        </div>
      </div>
    </div>
  );
};

export default AuthPage;
