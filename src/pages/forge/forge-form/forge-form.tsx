import ForgeInput from "@pages/forge/forge-input/forge-input.tsx";
import {usePostStore} from "@/store/usePostStore.ts";


const ForgeForm = () => {
  const {postDraft, setPostField} = usePostStore();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const {name, value} = e.target;
    setPostField(name as keyof typeof postDraft, value);
  };

  return (
    <form className="space-y-4">
      <ForgeInput
        label="Título de la ruta"
        name="title"
        placeholder="Ej: Ruta del frente del Ebro"
        value={postDraft.title}
        onChange={handleChange}
      />

      {/* Destino*/}
      {/*<ForgeInput
                name="address"
                placeholder="Ubicación principal"
                value={postDraft.address }
                onChange={handleChange}
                className="w-10/12 mx-auto"
            />*/}

      <ForgeInput
        label="Distancia"
        name="distance"
        placeholder="Calculada automáticamente"
        value={postDraft.distance || ""}
        onChange={() => {
        }} // opcional: no hace nada
        disabled
      />

      <ForgeInput
        label="Descripción"
        name="description"
        placeholder="Breve descripción de la ruta"
        value={postDraft.description}
        onChange={handleChange}
        textarea
        maxLength={100}
        rows={4}
      />


    </form>
  );
};

export default ForgeForm;
