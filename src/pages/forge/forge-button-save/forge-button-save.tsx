type Props = {
  onClick: () => void;
  text?: string;
  loading?: boolean;
  disabled?: boolean;
};

const ForgeButtonSave = ({
  onClick,
  text = 'Crear ruta',
  loading = false,
  disabled = false,
}: Props) => {
  const isDisabled = loading || disabled;

  return (
    <div className="relative group">
      <button
        type="button"
        className={`
          btn rounded-full px-6 flex items-center justify-center gap-2 transition-all duration-200
          ${
            isDisabled
              ? 'btn-disabled opacity-50 cursor-not-allowed'
              : 'btn-outline hover:btn-primary'
          }
        `}
        onClick={onClick}
        disabled={isDisabled}
        aria-disabled={isDisabled}
        aria-describedby={disabled ? 'moderation-tip' : undefined}
      >
        {loading && <span className="loading loading-spinner loading-sm"></span>}
        {!loading && text}
      </button>
    </div>
  );
};

export default ForgeButtonSave;
