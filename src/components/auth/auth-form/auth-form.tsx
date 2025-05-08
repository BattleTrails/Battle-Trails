import { useState } from "react";

import AuthHeader from "@components/auth/auth-header/auth-header.tsx";
import AuthImputs from "@components/auth/auth-imputs/auth-imputs.tsx";
import OAuthButton from "@components/auth/o-auth-button/o-auth-button.tsx";
import AuthButton from "@components/auth/auth-button/auth-button.tsx";
import {ChevronLeft,CircleArrowDown} from "lucide-react";

import {loginWithEmail, registerWithEmail} from "@/services/auth-service";
import { FirebaseError } from "firebase/app";
import {AuthMode} from "@/types";
import {useNavigate} from "react-router-dom";

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
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const navigate = useNavigate();
    const [mode, setMode] = useState<AuthMode>("login");


    const toggleMode = () => setMode(mode === "login" ? "register" : "login");
    const handleSubmit = async () => {
        setLoading(true);

        try {
            if (mode === "login") {
                await loginWithEmail(email, password);
            } else {
                await registerWithEmail(email, password);
            }

            console.log("Auth success");
            navigate("/");
            // Aquí podrías redirigir o cerrar modal
        } catch (err) {
            if (err instanceof FirebaseError) {
                console.error("❌ Firebase error:", err.code, err.message,);
            } else {
                console.error("❌ Error desconocido:", err);
            }
        } finally {
            setLoading(false);
        }
    };



    return (
        <div className="flex flex-col w-[600px] h-[800px] p-5 gap-6 rounded-field bg-primary/75 text-white">
            <AuthHeader mode={mode} />

            <div className="flex flex-col items-center gap-7 flex-1 justify-center">
                <AuthImputs
                    mode={mode}
                    email={email}
                    setEmail={setEmail}
                    password={password}
                    setPassword={setPassword}
                />

                <AuthButton
                    text={texts[mode].button}
                    onClick={handleSubmit}
                    loading={loading}
                />

                <div className="flex items-center gap-4 w-[350px] my-6">
                    <div className="flex-1 h-[1px] bg-white" />
                    <CircleArrowDown size={28} strokeWidth={1} />
                    <div className="flex-1 h-[1px] bg-white" />
                </div>

                <OAuthButton />

                <p
                    className="text-sm/4 text-center text-accent/70 mt-1 cursor-pointer hover:text-accent transition-colors duration-300"
                    onClick={toggleMode}
                >
                    {texts[mode].switchText}
                </p>
            </div>

        </div>
    );
};

export default AuthForm;
