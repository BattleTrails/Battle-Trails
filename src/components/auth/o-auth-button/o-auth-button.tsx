import { FcGoogle } from "react-icons/fc";

const OAuthButton = () => {
return(
    <button
        type="button"
        className="btn border-0 flex items-center justify-center gap-3 w-[300px] h-[42px] bg-white border border-gray-300 rounded-field shadow-sm hover:border-gray-400 transition-colors duration-300"
    >
        <FcGoogle className="w-6 h-6" />
        <span className="text-gray-700 text-sm font-medium">Continuar con Google</span>
    </button>
) ;
};

export default OAuthButton;