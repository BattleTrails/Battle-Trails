import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Mail, RefreshCw } from "lucide-react";
import { sendEmailVerification } from "firebase/auth";
import { auth } from "@config/firebaseConfig";

interface EmailVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  email: string;
}

const EmailVerificationModal = ({ isOpen, onClose, email }: EmailVerificationModalProps) => {
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [modalRoot, setModalRoot] = useState<HTMLElement | null>(null);

  useEffect(() => {
    // Crear un contenedor para el modal si no existe
    let root = document.getElementById('modal-root');
    if (!root) {
      root = document.createElement('div');
      root.id = 'modal-root';
      document.body.appendChild(root);
    }
    setModalRoot(root);
  }, []);

  const handleResendEmail = async () => {
    if (!auth.currentUser) return;
    
    setIsResending(true);
    try {
      await sendEmailVerification(auth.currentUser);
      setResendSuccess(true);
      setTimeout(() => setResendSuccess(false), 3000);
    } catch (error) {
      console.error("Error al reenviar email:", error);
    } finally {
      setIsResending(false);
    }
  };

  if (!isOpen || !modalRoot) return null;

  const modalContent = (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[99999] p-4">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-full">
              <Mail className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">
              Verifica tu correo
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-4">
          <p className="text-gray-600 leading-relaxed">
            Hemos enviado un correo de verificación a:
          </p>
          
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="font-medium text-gray-900 break-all">{email}</p>
          </div>

          <div className="space-y-3">
            <p className="text-gray-600 text-sm">
              Por favor, revisa tu bandeja de entrada y haz clic en el enlace de verificación.
            </p>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-yellow-800 text-sm">
                <strong>Importante:</strong> Si no verificas tu correo en 24 horas, tu cuenta será eliminada automáticamente.
              </p>
            </div>
          </div>

          {/* Resend button */}
          <div className="pt-2">
            <button
              onClick={handleResendEmail}
              disabled={isResending}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isResending ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Reenviando...
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4" />
                  Reenviar correo
                </>
              )}
            </button>
          </div>

          {/* Success message */}
          {resendSuccess && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="text-green-800 text-sm">
                ✅ Correo reenviado correctamente
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="w-full text-gray-600 hover:text-gray-800 transition-colors"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, modalRoot);
};

export default EmailVerificationModal; 