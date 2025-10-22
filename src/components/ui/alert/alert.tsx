import { useEffect } from 'react';
import { X } from 'lucide-react';

interface Props {
  message: string;
  onClose: () => void;
  type?: 'error' | 'success' | 'info';
}

const Alert = ({ message, onClose, type = 'error' }: Props) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);

    return () => clearTimeout(timer);
  }, [message, onClose]);

  if (!message) return null;

  const alertClasses = {
    error: 'alert-error',
    success: 'alert-success',
    info: 'alert-info',
  };

  return (
    <div
      role="alert"
      className={`alert ${alertClasses[type]} shadow-lg fixed top-4 right-0 mx-2 z-50 max-w-md`}
    >
      <div className="flex items-center gap-2">
        <span>{message}</span>
        <button onClick={onClose} className="btn btn-ghost btn-sm btn-circle">
          <X className="size-4" />
        </button>
      </div>
    </div>
  );
};

export default Alert;
