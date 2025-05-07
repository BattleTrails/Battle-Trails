
import {AuthButtonProps} from "@/types";


const AuthButton = ({ text, onClick, loading = false }: AuthButtonProps) => (
    <button
        onClick={onClick}
        disabled={loading}
        className={`btn w-[300px] h-[48px] bg-primary border-0  mt-3 text-white font-medium rounded-field shadow-sm hover:bg-[#405164] transition-colors duration-300 
                ${loading ? "opacity-60 cursor-not-allowed bg-[#405164]" : "hover:bg-[#405164]"}`}
    >
        {loading ? (
            <>
                <span className="loading loading-spinner loading-xs"></span>
                <span>Enviando...</span>
            </>
        ) : (
            text
        )}
    </button>
);

export default AuthButton;
