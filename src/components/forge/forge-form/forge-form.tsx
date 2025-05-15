import { useState } from "react";
import ForgeInput from "@components/forge/forge-input/forge-input.tsx";
import ForgeButtonSave from "@components/forge/forge-button-save/forge-button-save.tsx";


type ForgeFormData = {
    title: string;
    description: string;
    distance: string;
    address: string;
};

const ForgeForm = () => {
    const [form, setForm] = useState<ForgeFormData>({
        title: "",
        description: "",
        distance: "0 km", // automatically calculated
        address: "",
    });

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log("Formulario enviado:", form);
    };

    return (
        <form className="space-y-4" onSubmit={handleSubmit}>
            <ForgeInput
                label="Título de la ruta"
                name="title"
                placeholder="Ej: Ruta del frente del Ebro"
                value={form.title}
                onChange={handleChange}
            />

           {/* Destino*/}
            <ForgeInput
                name="address"
                placeholder="Ubicación principal"
                value={form.address}
                onChange={handleChange}
                className="w-10/12 mx-auto"
            />

            <ForgeInput
                label="Distancia"
                name="distance"
                placeholder="Calculada automáticamente"
                value={form.distance}
                onChange={handleChange}
                disabled
            />

            <ForgeInput
                label="Descripción"
                name="description"
                placeholder="Breve descripción de la ruta"
                value={form.description}
                onChange={handleChange}
                textarea
                maxLength={100}
                rows={4}
            />

            <div className="text-right pt-2">
                <ForgeButtonSave/>
            </div>
        </form>
    );
};

export default ForgeForm;
