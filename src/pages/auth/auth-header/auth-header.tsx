import {House} from "lucide-react";
import clsx from "clsx";
import {useNavigate} from "react-router-dom";

interface AuthHeaderProps {
  mode: "login" | "register";
}

const AuthHeader = ({mode}: AuthHeaderProps) => {
  const navigate = useNavigate();

  return (
    <>
      {/* Botón flotante en esquina */}
      <div
        className={clsx(
          "absolute transition-opacity duration-300 z-12",
          "top-3 left-3 sm:top-4 sm:left-4 md:top-10",
          mode === "login" ? "md:left-10" : "md:right-10"
        )}
      >
        <button
          onClick={() => navigate("/")}
          className="p-1.5 sm:p-2 rounded-full hover:bg-neutral/10 transition -translate-y-1 sm:-translate-y-2 md:-translate-y-5"
          aria-label="Volver al inicio"
        >
          <House className="w-4 h-4 sm:w-5 sm:h-5"/>
        </button>
      </div>

      {/* Encabezado centrado */}
      <div className="text-center mb-4 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-neutral">
          {mode === "login" ? "Bienvenido a Battle Trails" : "Únete a Battle Trails"}
        </h1>
        <p className="mt-1.5 sm:mt-2 text-sm sm:text-base text-neutral/80 font-medium">
          {mode === "login"
            ? "Hola de nuevo, inicia sesión y explora la historia."
            : "Regístrate y empieza a compartir tus rutas históricas."}
        </p>
      </div>
    </>
  );
};

export default AuthHeader;
