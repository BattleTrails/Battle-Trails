import {useBackgroundImage} from "@hooks/useBackgroundImage";
import AuthForm from "@components/auth/auth-form/auth-form.tsx";

const AuthPage = () => {
    const {image, isLoaded} = useBackgroundImage();

    return (
        <div
            className="min-h-screen flex items-center justify-center bg-center bg-cover relative transition-all duration-500"
            style={{
                backgroundImage: isLoaded ? `url(${image})` : undefined,
                backgroundColor: "#e5e7eb", // gris claro de fondo hasta que cargue
            }}
        >

            <AuthForm/>
            {/*<div className="absolute inset-0 bg-black/20 z-0"/>*/}
        </div>
    );
};

export default AuthPage;
