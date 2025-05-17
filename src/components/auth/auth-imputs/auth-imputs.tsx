import { Mail, Lock, User } from "lucide-react";
import AuthResetPasword from "@components/auth/auth-reset-pasword/auth-reset-pasword";
import AuthInput from "@components/auth/auth-input/auth-input";
import { AuthInputsProps, AuthMode } from "@/types";

interface Props extends AuthInputsProps {
    mode: AuthMode;
}

const AuthInputs = ({ email, password, setEmail, setPassword, mode }: Props) => {
    const isRegister = mode === "register";

    return (
        <div className="flex flex-col gap-5 w-[350px]">
            {isRegister && (
                <AuthInput
                    label="Nombre"
                    type="text"
                    name="name"
                    value={""} // Añade estado si lo necesitas
                    onChange={() => {}} // Añade setName si lo usas
                    icon={<User className="w-5 h-5" />}
                />
            )}

            <AuthInput
                label="Correo electrónico"
                type="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                icon={<Mail className="w-5 h-5" />}
            />

            <AuthInput
                label="Contraseña"
                type="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                icon={<Lock className="w-5 h-5" />}
                showToggle={true}
                showResetLink={mode === "login" && <AuthResetPasword mode={mode} />}
            />
        </div>
    );
};

export default AuthInputs;
