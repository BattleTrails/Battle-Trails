import {useBackgroundImage} from "@hooks/useBackgroundImage";
import AuthForm from "@components/auth/auth-form/auth-form.tsx";
import {useAuth} from "@context/auth-context.tsx";
import AuthAlert from "@components/auth/auth-alert/auth-alert.tsx";
import {useState} from "react";
import clsx from "clsx";
import banner from "@assets/authimgs/banner-cell-phone-map-1.webp"


const AuthPage = () => {
    const { image, isLoaded } = useBackgroundImage();
    const { errorMessage,clearError } = useAuth(); // obtenemos el error

  const [isOnLeft, setIsOnLeft] = useState(true);


  return (


    <div className="relative w-screen h-screen bg-base overflow-hidden">

      {/* Alerta de error en top-right */}
      {errorMessage && (
        <div className="absolute top-6 right-6 z-50">
          <AuthAlert message={errorMessage} onClose={clearError}/>
        </div>
      )}
      {/* Forms  login/register */}
      <div className="flex w-full h-full">
        <div className="w-1/2 flex items-center justify-center"> <AuthForm /></div>
        <div className="w-1/2 flex items-center justify-center"> <AuthForm /></div>
      </div>

      {/* banner centrado en su mitad */}
      <div
        className={clsx(
          "absolute top-0 h-full w-1/2 flex items-center justify-center transition-all duration-500 z-10",
          isOnLeft ? "left-0" : "left-1/2"
        )}
      >
        <div className="w-[95%] h-[95%] rounded-2xl relative flex items-center justify-center text-white text-xl font-bold shadow-lg"
             style={{
               backgroundImage: `url(${banner})`,
               backgroundSize: "cover",
               backgroundPosition: "center",
             }}>


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
