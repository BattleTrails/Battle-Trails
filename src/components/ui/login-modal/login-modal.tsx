import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

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
    return (
        <AnimatePresence>
            {showModal && (
                <motion.div
                    className="fixed inset-0 bg-black/70 flex justify-center items-center z-50 p-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setShowModal(false)}
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
                            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
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
                                className="bg-black text-white px-6 py-2 rounded-full hover:bg-gray-800 transition-colors"
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