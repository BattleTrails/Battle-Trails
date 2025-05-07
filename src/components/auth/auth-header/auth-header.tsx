import {ChevronLeft, Shield } from "lucide-react";
import iconslogo from "@assets/iconslogo.svg"
import  hello from "@assets/login.svg";
import { useNavigate } from "react-router-dom";

interface AuthHeaderProps {
    mode: "login" | "register";
}

const AuthHeader = ({ mode }: AuthHeaderProps) => {
    const navigate = useNavigate();
    return (
        <div className="flex flex-col justify-center   gap-7">

            <div className="flex justify-start w-full">
                <button
                    onClick={() => navigate("/")}
                    className=" cursor-pointer  text-white hover:text-accent transition-colors duration-300 flex  gap-1 "
                    aria-label="Volver a la página principal"
                >
                    <ChevronLeft size={20} strokeWidth={1.5} />
                    <span className="text-sm hidden sm:inline">Volver</span>
                </button>
            </div>
            {/* Logo */}
            <div className="flex justify-center w-full">
                <img src={iconslogo} alt="Logo" />
            </div>

            {/* Título + Icono */}
            <div className="flex items-end justify-center gap-3 text-[20px]">
                <div className="w-[150px] text-right">
                    <p>{mode === "login" ? "Hola de nuevo!" : "Bienvenido!"}</p>
                </div>

                {/* Icono dinámico */}
                {mode === "login" ? (
                    <img src={hello} className="w-6 h-8" />
                ) : (
                    <Shield color="#D4AF37" className="w-6 h-8" />
                )}

                {/* Texto derecho */}
                <div className="w-[150px] text-left">
                    <p>{mode === "login" ? "Inicia sesión" : "Regístrate"}</p>
                </div>
            </div>
        </div>
    );
};

export default AuthHeader;
