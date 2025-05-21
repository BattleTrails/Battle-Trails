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
          "absolute top-10 transition-opacity duration-300 z-12",
          mode === "login" ? "left-10" : "right-10",
        )}
      >
        <button
          onClick={() => navigate("/")}
          className="p-2 rounded-full hover:bg-neutral/10 transition"
          aria-label="Volver al inicio"
        >
          <House className="w-5 h-5"/>
        </button>
      </div>

      {/* Encabezado centrado */}
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-neutral">
          {mode === "login" ? "Bienvenido a Battle Trails" : "Únete a Battle Trails"}
        </h1>
        <p className="mt-2 text-base text-neutral/80 font-medium">
          {mode === "login"
            ? "Hola de nuevo, inicia sesión y explora la historia."
            : "Regístrate y empieza a compartir tus rutas históricas."}
        </p>
      </div>
    </>
  );
};

export default AuthHeader;
