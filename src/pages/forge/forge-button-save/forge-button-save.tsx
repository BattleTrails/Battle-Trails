type Props = {
  onClick: () => void;
  text?: string;
  loading?: boolean;
};

const ForgeButtonSave = ({ onClick, text = "Crear ruta", loading = false }: Props) => {
  return (
    <button
      type="submit"
      className={`btn btn-outline rounded-full px-6 ${loading ? 'loading' : ''}`}
      onClick={onClick}
      disabled={loading}
    >
      {loading ? '' : text}
    </button>
  );
};

export default ForgeButtonSave;