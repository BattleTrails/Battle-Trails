import { useState } from "react";
import AuthHeader from "@components/auth/auth-header/auth-header.tsx";
import AuthImputs from "@components/auth/auth-imputs/auth-imputs.tsx";
import OAuthButton from "@components/auth/o-auth-button/o-auth-button.tsx";
import AuthButton from "@components/auth/auth-button/auth-button.tsx";
import {CircleArrowDown} from "lucide-react";

const texts = {
    login: {
        button: "Iniciar sesión",
        switchText: "¿No tienes cuenta? Regístrate aquí",
    },
    register: {
        button: "Crear cuenta",
        switchText: "¿Ya tienes cuenta? Inicia sesión aquí",
    },
};

const AuthForm = () => {
    const [mode, setMode] = useState<"login" | "register">("login");

    const toggleMode = () => setMode(mode === "login" ? "register" : "login");

    return (
        <div className="flex flex-col w-[600px] h-[800px] p-5 items-center gap-7 rounded-field bg-primary/75 text-white">
            <AuthHeader mode={mode} />

            <AuthImputs />

            <AuthButton text={texts[mode].button} />

            {/* Separador */}
            <div className="flex items-center gap-4 w-[350px] my-6">
                <div className="flex-1 h-[1px] bg-white" />
                <CircleArrowDown size={28} strokeWidth={1} />
                <div className="flex-1 h-[1px] bg-white" />
            </div>

            <OAuthButton />

            {/* Cambio de modo simple sin animación */}
            <p
                className="text-sm/4 text-center text-accent/70 mt-1 cursor-pointer hover:text-accent transition-colors duration-300"
                onClick={toggleMode}
            >
                {texts[mode].switchText}
            </p>
        </div>
    );
};

export default AuthForm;
