import {Lock, Mail, User} from "lucide-react";
import AuthResetPasword from "@pages/auth/auth-reset-pasword/auth-reset-pasword.tsx";
import AuthInput from "@pages/auth/auth-input/auth-input.tsx";
import {AuthMode} from "@/types";

interface Props {
  mode: AuthMode;
  name: string; // Solo necesario si el modo es "register"
  setName: (value: string) => void; // Opcional si no se usa
  email: string;
  password: string;
  setEmail: (value: string) => void;
  setPassword: (value: string) => void;
}

const AuthInputs = ({name , setName,email, password, setEmail, setPassword, mode}: Props) => {
  const isRegister = mode === "register";

  return (
    <div className="flex flex-col gap-5 w-[350px]">
      {isRegister && (
        <AuthInput
          label="Nombre"
          type="text"
          name="name"
          value={name} // Añade estado si lo necesitas
          onChange={(e) => setName(e.target.value)}
            // Añade setName si lo usas
          icon={<User className="w-5 h-5"/>}
        />
      )}

      <AuthInput
        label="Correo electrónico"
        type="email"
        name="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        icon={<Mail className="w-5 h-5"/>}
      />

      <AuthInput
        label="Contraseña"
        type="password"
        name="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        icon={<Lock className="w-5 h-5"/>}
        showToggle={true}
        showResetLink={mode === "login" && <AuthResetPasword mode={mode}/>}
      />
    </div>
  );
};

export default AuthInputs;
