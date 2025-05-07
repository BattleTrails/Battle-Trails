import {FcGoogle} from "react-icons/fc";
import {loginWithGoogle} from "@/services/auth-service.ts";
import {useNavigate} from "react-router-dom";
import {FirebaseError} from "firebase/app";


const OAuthButton = () => {

    const navigate = useNavigate();
    const handleGoogleLogin = async () => {
        try {
            await loginWithGoogle();
            console.log("✅ Login con Google correcto");
            navigate("/"); // redirige a home
        } catch (err) {
            if (err instanceof FirebaseError) {
                console.error("❌ Firebase error:", err.code, err.message);
            } else {
                console.error("❌ Error desconocido:", err);
            }
        }
    }
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