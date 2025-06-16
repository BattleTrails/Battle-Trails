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
        <div className="modal-box bg-base-100 border-2 border-secondary/20 shadow-lg">
          <form method="dialog">
            <button
              className="btn-sm btn-circle btn-ghost text-secondary hover:text-secondary-focus cursor-pointer absolute right-2 top-2">
              ✕
            </button>
          </form>

          <h3 className="text-secondary font-bold text-lg mb-2">Restablecer contraseña</h3>
          <p className="text-base-content/80 text-sm mb-4">Te enviaremos un correo con instrucciones.</p>

          <input
            type="email"
            placeholder="Tu correo electrónico"
            className="input input-bordered w-full mb-4 bg-base-200 border-secondary/20 focus:border-secondary focus:ring-2 focus:ring-secondary/20"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <div className="flex justify-center">
            <button
              onClick={handleReset}
              className="btn btn-secondary hover:btn-secondary-focus transition-colors"
            >
              Enviar correo
            </button>
          </div>

          {message && <p className="mt-3 text-sm text-secondary text-center">{message}</p>}
        </div>
      </dialog>
    </>
  );
};

export default AuthResetPassword;
