import {useNavigate} from "react-router-dom";
import {useAuth} from "@context/auth-context.tsx";
import {AuthMode} from "@/types";
import {useState} from "react";
import AuthHeader from "@pages/auth/auth-header/auth-header.tsx";
import AuthImputs from "@pages/auth/auth-imputs/auth-imputs.tsx";
import OAuthButton from "@pages/auth/o-auth-button/o-auth-button.tsx";
import AuthButton from "@pages/auth/auth-button/auth-button.tsx";
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

const AuthForm = ({mode}: { mode: AuthMode }) => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const {login, register} = useAuth();


  const handleSubmit = async () => {
    setLoading(true);
    const success =
      mode === "login"
        ? await login(email, password)
        : await register(email, password);

    if (success) navigate("/");

    setLoading(false);
  };

  return (
    <div className="flex flex-col w-[600px] h-[800px] justify-center gap-6 rounded-field bg-white text-primary ">
      <AuthHeader mode={mode}/>

      <div className="flex flex-col items-center gap-7 ">
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
          <div className="flex-1 h-[1px] bg-neutral"/>
          <CircleArrowDown size={28} strokeWidth={1}/>
          <div className="flex-1 h-[1px] bg-neutral"/>
        </div>

        <OAuthButton/>

      </div>
    </div>
  );
};

export default AuthForm;
