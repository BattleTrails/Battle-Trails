import {AuthAlertProps} from "@/types";
import {useEffect} from "react";


const AuthAlert = ({ message, onClose }: AuthAlertProps) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 5000); // ⏱️ desaparece tras 5 segundos

        return () => clearTimeout(timer); // limpieza
    }, [message]);

    if (!message) return null;

    return (
        <div role="alert" className="alert alert-error alert-soft">
            <span>{message}</span>
        </div>
    );
};

export default AuthAlert;
