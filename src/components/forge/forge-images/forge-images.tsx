import {useRef} from "react";


const ForgeImages = () => {
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className="bg-neutral/5 rounded-lg border border-dashed border-neutral/30 min-h-[400px] flex flex-col items-center justify-center p-4 text-center">
            <div>
                <p className="text-sm text-neutral">
                    Añade algunas imágenes de tu ruta
                </p>
                <p className="text-xs mt-1 text-neutral/70">
                    Para empezar, necesitarás 4 fotos. Después podrás añadir más o hacer cambios.
                </p>

                <button
                    className="btn btn-sm btn-outline mt-4 rounded-full"
                    type="button"
                    onClick={handleUploadClick}
                >
                    Subir fotos
                </button>

                {/* Input oculto */}
                <input
                    type="file"
                    accept="image/*"
                    multiple
                    ref={fileInputRef}
                    className="hidden"
                />
            </div>
        </div>
    );
};

export default ForgeImages;