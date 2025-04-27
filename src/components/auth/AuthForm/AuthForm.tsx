import AuthHeader from "@components/auth/AuthHeader/AuthHeader.tsx";
import AuthImputs from "@components/auth/AuthImputs/AuthImputs.tsx";
import OAuthButton from "@components/auth/OAuthButton/OAuthButton.tsx";
import AuthButton from "@components/auth/AuthButton/AuthButton.tsx";


const AuthForm = () => {
    return (
        <div
            className="flex flex-col w-[600px] h-[800px] p-5 items-center gap-7 rounded-field bg-primary/75 text-white">
            <AuthHeader/>
            <AuthImputs/>
            <AuthButton text={"Iniciar Sesion"}/>
            <div className="flex items-center gap-4 w-[350px] my-6">
                <div className="flex-1 h-px bg-white"/>
                <span className="text-sm text-white">o continúa con</span>
                <div className="flex-1 h-px bg-white"/>
            </div>

            <OAuthButton/>
            <p className="text-sm/4 text-center text-accent/70 mt-1 cursor-pointer hover:text-accent">¿No tienes cuenta? Registrate aquí</p>
        </div>
    );
};

export default AuthForm;