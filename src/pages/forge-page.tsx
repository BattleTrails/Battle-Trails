import ForgeImages from "@components/forge/forge-images/forge-images.tsx";
import ForgeForm from "@components/forge/forge-form/forge-form.tsx";


const ForgePage = () => {
    return (
        <div className="max-w-6xl mx-auto p-6 rounded-xl bg-base-100 shadow-sm border border-neutral/10">
            <h1 className="text-2xl font-bold text-neutral mb-6">Crear ruta</h1>
            <div className="flex flex-col md:flex-row gap-8">
                {/* Columna izquierda */}
                <div className="flex-1">
                    <ForgeImages />
                </div>

                {/* Columna derecha */}
                <div className="flex-1">
                    <ForgeForm />
                </div>
            </div>
        </div>
    );
};

export default ForgePage;
