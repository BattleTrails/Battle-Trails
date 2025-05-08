import {useBackgroundImage} from "@hooks/useBackgroundImage";
import AuthForm from "@components/auth/auth-form/auth-form.tsx";
import {useAuth} from "@context/auth-context.tsx";
import AuthAlert from "@components/auth/auth-alert/auth-alert.tsx";


const AuthPage = () => {
    const { image, isLoaded } = useBackgroundImage();
    const { errorMessage,clearError } = useAuth(); // obtenemos el error

    return (
        <div
            className="min-h-screen flex items-center justify-center bg-center bg-cover relative transition-all duration-500"
            style={{
                backgroundImage: isLoaded ? `url(${image})` : undefined,
                backgroundColor: "#e5e7eb",
            }}
        >
            {/* Alerta de error en top-right */}
            {errorMessage && (
                <div className="absolute top-6 right-6 z-50">
                    <AuthAlert message={errorMessage} onClose={clearError}/>
                </div>
            )}

            <AuthForm />
        </div>
    );
};

export default AuthPage;
