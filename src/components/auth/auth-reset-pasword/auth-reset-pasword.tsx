import {useRef, useState} from "react";
import {resetPassword} from "@/services/auth-service.ts";
import {FirebaseError} from "firebase/app";
import {AuthMode} from "@/types";

interface Props {
    mode:AuthMode;
}

const AuthResetPasword = ({mode}:Props) => {
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const dialogRef = useRef<HTMLDialogElement>(null);



    const openModal = () => {
        setMessage("")
        setEmail("")
        dialogRef.current?.showModal();
    };
    const handleReset = async () => {
        try {
            await resetPassword(email);
            setMessage("📩 Te hemos enviado un correo para restablecer tu contraseña.");

            setTimeout(() => {
                dialogRef.current?.close();
            }, 2000);
        } catch (err) {
            if (err instanceof FirebaseError) {
                console.error("Firebase error:", err.code, err.message);
                setMessage("❌ No se pudo enviar el correo. Revisa el email.");
            } else {
                console.error("Error desconocido:", err);
                setMessage("❌ Ha ocurrido un error.");
            }
        }
    };
    return (
        <>

            <button
                className={`text-sm text-left text-accent/70 hover:text-accent w-fit cursor-pointer
                ${mode === "login" ? "" : "invisible pointer-events-none"}`}
                onClick={openModal}
            >
                ¿Olvidaste tu contraseña?
            </button>



            <dialog ref={dialogRef} className="modal">

                <div className=" modal-box bg-primary/98">
                    <form method="dialog">
                        <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2 shadow-none hover:shadow-none focus:shadow-none">✕</button>
                    </form>

                    <h3 className="font-bold text-lg mb-2">Restablecer contraseña</h3>
                    <p className="text-sm mb-4">Te enviaremos un correo con instrucciones.</p>

                    <input
                        type="email"
                        placeholder="Tu correo electronico"
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


                    {message && <p className="mt-3 text-sm text-center">{message}</p>}
                </div>
            </dialog>
        </>
    );
};
export default AuthResetPasword;