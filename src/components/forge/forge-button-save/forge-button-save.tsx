
type Props = {
    onClick: () => void;
};
const ForgeButtonSave = ({onClick} : Props) => {
return (
    <button type="submit" className="btn btn-outline rounded-full px-6" onClick={onClick}>
        Crear ruta
    </button>
);
};

export default ForgeButtonSave;