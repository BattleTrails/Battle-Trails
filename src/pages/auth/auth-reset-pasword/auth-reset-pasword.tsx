import {useRef, useState} from "react";
import {useAuth} from "@context/auth-context.tsx"; // 👈 usamos el hook global
import {AuthMode} from "@/types";

interface Props {
  mode: AuthMode;
}

const AuthResetPassword = ({mode}: Props) => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const dialogRef = useRef<HTMLDialogElement>(null);
  const {resetPassword} = useAuth();

  const openModal = () => {
    setMessage("");
    setEmail("");
    dialogRef.current?.showModal();
  };

  const handleReset = async () => {
    const success = await resetPassword(email);
    if (success) {
      setMessage("📩 Te hemos enviado un correo para restablecer tu contraseña.");
      setTimeout(() => dialogRef.current?.close(), 2000);
    } else {
      setMessage("❌ No se pudo enviar el correo. Revisa el email.");
    }
  };

  return (
    <>
      <button
        className={`text-sm text-left text-neutral/70 hover:text-neutral w-fit cursor-pointer ${
          mode === "login" ? "" : "invisible pointer-events-none"
        }`}
        onClick={openModal}
      >
        ¿Olvidaste tu contraseña?
      </button>

      <dialog ref={dialogRef} className="modal">
        <div className="modal-box bg-primary/98">
          <form method="dialog">
            <button
              className=" btn-sm btn-circle text-accent cursor-pointer absolute right-2 top-2 shadow-none hover:shadow-none focus:shadow-none">
              ✕
            </button>
          </form>

          <h3 className=" text-accent font-bold text-lg mb-2">Restablecer contraseña</h3>
          <p className="text-accent text-sm mb-4">Te enviaremos un correo con instrucciones.</p>

          <input
            type="email"
            placeholder="Tu correo electrónico"
            className="input text-neutral input-bordered w-full mb-4 focus:ring-2 focus:ring-secondary"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <div className="flex justify-center">
            <button
              onClick={handleReset}
              className="btn btn-secondary shadow-none hover:shadow-none focus:shadow-none"
            >
              Enviar correo
            </button>
          </div>

          {message && <p className="mt-3 text-sm text-accent text-center">{message}</p>}
        </div>
      </dialog>
    </>
  );
};

export default AuthResetPassword;
