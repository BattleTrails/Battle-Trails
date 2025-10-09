import {FcGoogle} from "react-icons/fc";
import {useNavigate} from "react-router-dom";
import {useAuth} from "@context/auth-context.tsx";

const OAuthButton = () => {
  const navigate = useNavigate();
  const {loginWithGoogle} = useAuth(); // usamos el hook global

  const handleGoogleLogin = async () => {
    const success = await loginWithGoogle();
    if (success) {
      navigate("/");
    }
  };

  return (
    <button
      type="button"
      onClick={handleGoogleLogin}
      className="btn border-0 flex items-center justify-center gap-3 w-[300px] h-[42px] bg-white border border-gray-300 rounded-field shadow-sm hover:border-gray-400 transition-colors duration-300"
    >
      <FcGoogle className="w-6 h-6"/>
      <span className="text-gray-700 text-sm font-medium">Continuar con Google</span>
    </button>
  );
};

export default OAuthButton;
