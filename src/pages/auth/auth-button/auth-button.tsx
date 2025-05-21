interface Props {
  text: string;
  onClick: () => void;
  loading?: boolean;
}

const AuthButton = ({text, onClick, loading = false}: Props) => (
  <button
    onClick={onClick}
    disabled={loading}
    className={`btn w-[200px] h-[48px] bg-primary border-1  mt-3 text-white font-light rounded-full shadow-sm  transition-colors duration-300 
                ${loading ? "opacity-60 cursor-not-allowed bg-[#405164]" : "hover:bg-white hover:text-primary"}`}
  >
    {loading ? (
      <>
        <span className="loading loading-spinner loading-xs text-accent"></span>
        <span>Enviando...</span>
      </>
    ) : (
      text
    )}
  </button>
);

export default AuthButton;
