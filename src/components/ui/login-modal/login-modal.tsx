import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useEffect } from "react";

interface LoginModalProps {
    showModal: boolean;
    setShowModal: (value: boolean) => void;
    title?: string;
    message?: string;
}

const LoginModal = ({ 
    showModal, 
    setShowModal,
    title = "Inicia sesión para continuar",
    message = "Necesitas iniciar sesión para continuar con esta acción."
}: LoginModalProps) => {
    // Bloquear scroll cuando el modal esté abierto
    useEffect(() => {
        if (showModal) {
            // Bloquear scroll del body
            document.body.style.overflow = 'hidden';
            
            return () => {
                document.body.style.overflow = 'unset';
            };
        }
    }, [showModal]);

    return (
        <AnimatePresence>
            {showModal && (
                <motion.div
                    className="fixed inset-0 bg-black/70 flex justify-center items-center z-[9999] p-4 cursor-default"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={(e) => {
                        e.stopPropagation();
                        setShowModal(false);
                    }}
                    onMouseDown={(e) => e.stopPropagation()}
                    onMouseUp={(e) => e.stopPropagation()}
                    onTouchStart={(e) => e.stopPropagation()}
                    onTouchEnd={(e) => e.stopPropagation()}
                >
                    <motion.div
                        className="bg-white rounded-xl w-full max-w-md p-6 shadow-lg relative"
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            onClick={() => setShowModal(false)}
                            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 cursor-pointer"
                            aria-label="Cerrar modal"
                        >
                            <X className="size-5" />
                        </button>

                        <div className="text-center">
                            <h2 className="text-xl font-semibold mb-4">{title}</h2>
                            <p className="text-gray-600 mb-6">
                                {message}
                            </p>
                            <button
                                onClick={() => {
                                    setShowModal(false);
                                    // Aquí podrías redirigir al login
                                    window.location.href = '/auth';
                                }}
                                className="bg-black text-white px-6 py-2 rounded-full hover:bg-gray-800 transition-colors cursor-pointer"
                            >
                                Iniciar sesión
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default LoginModal; 