import {useBackgroundImage} from "@hooks/useBackgroundImage";
import AuthForm from "@components/auth/auth-form/auth-form.tsx";
import {useAuth} from "@context/auth-context.tsx";
import AuthAlert from "@components/auth/auth-alert/auth-alert.tsx";
import {useState} from "react";
import clsx from "clsx";


const AuthPage = () => {
    /*const { image, isLoaded } = useBackgroundImage();
    const { errorMessage,clearError } = useAuth(); // obtenemos el error*/

  const [isOnLeft, setIsOnLeft] = useState(true);


  return (
        /*<div
            className="min-h-screen flex items-center justify-center bg-neutral"

        >
            {/!* Alerta de error en top-right *!/}
            {errorMessage && (
                <div className="absolute top-6 right-6 z-50">
                    <AuthAlert message={errorMessage} onClose={clearError}/>
                </div>
            )}

            <AuthForm />
        </div>*/

    <div className="relative w-screen h-screen bg-red-500 overflow-hidden">
      {/* Contenido base (div A con hijos 1A y 2A) */}
      <div className="flex w-full h-full">
        <div className="w-1/2 flex items-center justify-center bg-orange-300">1A</div>
        <div className="w-1/2 flex items-center justify-center bg-pink-300">2A</div>
      </div>

      {/* Panel deslizante encima (div B) */}
      <div
        className={clsx(
          "absolute top-0 h-200 w-200 p-10 w-1/2 bg-blue-500 transition-all duration-500 z-10",
          isOnLeft ? "left-0" : "left-1/2"
        )}
      >
        <div className="relative h-full flex items-center justify-center text-white font-bold text-xl">
          B

          {/* Botón izquierda */}
          <button
            onClick={() => setIsOnLeft(true)}
            className="absolute left-4 bottom-6 bg-black text-white px-4 py-2 rounded"
          >
            Mostrar 1A
          </button>

          {/* Botón derecha */}
          <button
            onClick={() => setIsOnLeft(false)}
            className="absolute right-4 bottom-6 bg-black text-white px-4 py-2 rounded"
          >
            Mostrar 2A
          </button>
        </div>
      </div>
    </div>


  );
};

export default AuthPage;
