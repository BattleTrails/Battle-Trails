import { Handshake, Shield } from "lucide-react";
import iconslogo from "@assets/iconslogo.svg"

interface AuthHeaderProps {
    mode: "login" | "register";
}

const AuthHeader = ({ mode }: AuthHeaderProps) => {
    return (
        <div className="flex flex-col justify-center pt-8 text-center gap-8">
            {/* Logo */}
            <img src={iconslogo} alt="Logo" className="m-auto" />

            {/* Título + Icono */}
            <div className="flex items-end justify-center gap-3 text-[20px]">
                <div className="w-[140px] text-right">
                    <p>{mode === "login" ? "Hola de nuevo!" : "Bienvenido!"}</p>
                </div>

                {/* Icono dinámico */}
                {mode === "login" ? (
                    <Handshake color="#D4AF37" className="w-6 h-6" />
                ) : (
                    <Shield color="#D4AF37" className="w-6 h-7" />
                )}

                {/* Texto derecho */}
                <div className="w-[140px] text-left">
                    <p>{mode === "login" ? "Inicia sesión" : "Regístrate"}</p>
                </div>
            </div>
        </div>
    );
};

export default AuthHeader;
