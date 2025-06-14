type Props = {
  onClick: () => void;
  text?: string;
  loading?: boolean;
};

const ForgeButtonSave = ({ onClick, text = "Crear ruta", loading = false }: Props) => {
  return (
    <button
      type="button"
      className="btn btn-outline rounded-full px-6 flex items-center justify-center gap-2"
      onClick={onClick}
      disabled={loading}
    >
      {loading && (
        <span className="loading loading-spinner loading-sm"></span>
      )}
      {!loading && text}
    </button>
  );

};

export default ForgeButtonSave;