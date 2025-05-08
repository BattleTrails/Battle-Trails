import { ChevronLeft, Shield } from "lucide-react";
import iconslogo from "@assets/iconslogo.svg";
import hello from "@assets/login.svg";
import { useNavigate } from "react-router-dom";

interface AuthHeaderProps {
    mode: "login" | "register";
}

const AuthHeader = ({ mode }: AuthHeaderProps) => {
    const navigate = useNavigate();

    return (
        <div className="flex flex-col justify-center gap-8">
            {/* Botón Volver */}
            <div className="flex w-full">
                <button
                    onClick={() => navigate("/")}
                    className="flex items-center text-accent/70 hover:text-accent transition-colors duration-300"
                    aria-label="Volver a la página principal"
                >
                    <ChevronLeft size={24} strokeWidth={1.5} />
                    <span className="ml-2 text-sm sm:inline">Volver</span>
                </button>
            </div>

            {/* Logo reducido */}
            <div className="flex justify-center w-full">
                <img
                    src={iconslogo}
                    alt="Logo Battle Trails"
                    className="w-10 h-auto"
                />
            </div>

            {/* Contenido dinámico con animación */}
            <div
                key={mode} // forzar remount y reiniciar animación en cambio de mode
                style={{ animation: "fadeIn 0.4s ease-in-out" }}
                className="flex items-center justify-center gap-4"
            >
                {mode === "login" ? (
                    <div className="flex items-center justify-center gap-4">
                        <p className="text-2xl sm:text-3xl">Hola de nuevo!</p>

                        <img
                            src={hello}
                            alt="Icono de saludo"
                            className="w-8 h-8 sm:w-10 sm:h-10"
                        />

                        <p className="text-2xl sm:text-3xl font-bold text-accent">
                            Inicia sesión
                        </p>
                    </div>
                ) : (
                    <>
                        <Shield
                            className="w-8 h-8 sm:w-10 sm:h-10"
                            color="#D4AF37"
                        />
                        <p className="text-2xl sm:text-3xl font-bold text-accent">
                            Regístrate
                        </p>
                    </>
                )}
            </div>
        </div>
    );
};

export default AuthHeader;
