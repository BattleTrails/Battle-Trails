import {useState} from "react";
import {Eye, EyeOff} from "lucide-react";

interface Props {
  label: string;
  type: "text" | "email" | "password";
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  icon?: React.ReactNode;
  showToggle?: boolean; // Mostrar botón para mostrar/ocultar contraseña
  showResetLink?: React.ReactNode;
}

const AuthInput = ({label, type, name, value, onChange, icon, showToggle = false, showResetLink,}: Props) => {
  const [showPassword, setShowPassword] = useState(false);

  const isPassword = type === "password";
  const inputType = isPassword && showToggle ? (showPassword ? "text" : "password") : type;

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={name} className="text-left font-medium text-neutral">
        {label}
      </label>
      <div className="relative">
        {icon && (
          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                        {icon}
                    </span>
        )}
        <input
          type={inputType}
          id={name}
          name={name}
          placeholder={`Introduce tu ${label.toLowerCase()}`}
          className={`w-full h-[48px] bg-white border border-gray-200 rounded-field
                        ${icon ? "pl-10" : "pl-4"} ${showToggle ? "pr-10" : "pr-4"} py-3
                        text-gray-800 placeholder-gray-400 shadow focus:outline-none
                        focus:ring-2 focus:ring-secondary`}
          value={value}
          autoComplete={isPassword ? "new-password" : "on"}
          onChange={onChange}
        />
        {showToggle && isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute cursor-pointer right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-secondary"
          >
            {showPassword ? <Eye className="w-5 h-5"/> : <EyeOff className="w-5 h-5"/>}
          </button>
        )}
      </div>

      {showResetLink && <div className="mt-1">{showResetLink}</div>}
    </div>
  );
};

export default AuthInput;
