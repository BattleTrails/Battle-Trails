import {useNavigate} from "react-router-dom";
import {useAuth} from "@context/auth-context.tsx";
import {AuthMode} from "@/types";
import {useState} from "react";
import AuthHeader from "@pages/auth/auth-header/auth-header.tsx";
import AuthImputs from "@pages/auth/auth-imputs/auth-imputs.tsx";
import OAuthButton from "@pages/auth/o-auth-button/o-auth-button.tsx";
import AuthButton from "@pages/auth/auth-button/auth-button.tsx";
import {CircleArrowDown} from "lucide-react";
import Alert from "@components/ui/alert/alert.tsx";
import EmailVerificationModal from "@components/ui/email-verification-modal/email-verification-modal.tsx";

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

const AuthForm = ({mode, onModeChange,}: { mode: AuthMode; onModeChange: (newMode: AuthMode) => void; }) => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const {login, register} = useAuth();
  const [name,setName] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState<"error" | "success" | "info">("error");
  const [showVerificationModal, setShowVerificationModal] = useState(false);


  const isValidName = (name: string): boolean => {
    const trimmed = name.trim();
    const regex = /^[A-Za-zÁÉÍÓÚáéíóúñÑ\s]{2,30}$/;
    return regex.test(trimmed);
  };


  const handleSubmit = async () => {
    if (mode === "register" && !isValidName(name)) {
      setAlertMessage("El nombre debe tener solo letras y espacios, con mínimo 2 caracteres.");
      setAlertType("error");
      return;
    }

    setLoading(true);

    const username = name.trim().toLowerCase().replace(/\s+/g, "_");

    if (mode === "login") {
      const success = await login(email, password);
      if (success) navigate("/");
    } else {
      const result = await register(email, password, name, username);
      if (result.success) {
        setShowVerificationModal(true);
      }
    }
    
    setLoading(false);
  };


  return (
    <div className="flex flex-col w-[600px] h-[800px] justify-center gap-0 sm:gap-6 rounded-field bg-white text-primary ">
      {alertMessage && (
        <Alert 
          message={alertMessage} 
          onClose={() => setAlertMessage("")} 
          type={alertType}
        />
      )}
      <AuthHeader mode={mode}/>

      <div className="flex flex-col items-center sm:gap-4 gap-0 ">

        <AuthImputs
          setName={setName}
          mode={mode}
          name={name}
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
        {/* Solo visible en mobile/tablet (<1024px) */}
        <div className="block lg:hidden mt-6 text-sm text-center text-neutral">
          <button
            onClick={() => onModeChange(mode === "login" ? "register" : "login")}
            className="underline underline-offset-4 hover:text-secondary transition-all"
          >
            {texts[mode].switchText}
          </button>
        </div>


      </div>

      {/* Modal de verificación de email */}
      <EmailVerificationModal
        isOpen={showVerificationModal}
        onClose={() => setShowVerificationModal(false)}
        email={email}
      />
    </div>
  );
};

export default AuthForm;
