import { useRef } from "react";
import { compressImages } from "@/utils/compress-images";
import { ImagePlus, X } from "lucide-react";

type Props = {
  images: File[];
  setImages: (files: File[]) => void;
  label?: string;
  mode?: "main" | "waypoint";
};

const ForgeImages = ({ mode, images, setImages, label = "Añade algunas imágenes" }: Props) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFilesSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawFiles = Array.from(e.target.files || []);
    const compressed = await compressImages(rawFiles);
    setImages([...images, ...compressed]);
  };

  const handleRemoveImage = (index: number) => {
    const updated = [...images];
    updated.splice(index, 1);
    setImages(updated);
  };

  const hasImages = images.length > 0;

  return (
    <div className="w-full max-w-[400px] md:max-w-[500px] lg:max-w-full mx-auto bg-neutral/5 rounded-lg border border-dashed border-neutral/30 p-4">
      {!hasImages && (
        mode === "waypoint" ? (
          <div className="flex items-center gap-2">
            <button
              className="w-20 h-20 flex items-center justify-center border border-neutral/30 rounded-md hover:bg-neutral/10 transition"
              type="button"
              onClick={handleUploadClick}
            >
              <ImagePlus size={20} />
            </button>
            <p className="text-sm text-neutral/60">Añadir imágenes a esta parada</p>
            <input
              type="file"
              accept="image/*"
              multiple
              ref={fileInputRef}
              className="hidden"
              onChange={handleFilesSelected}
            />
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 justify-center text-center min-h-[400px]">
            <ImagePlus />
            <p className="text-sm text-neutral">{label}</p>
            <p className="text-xs mt-1 text-neutral/70">
              Para empezar, necesitas al menos 1 foto. Luego puedes añadir más o cambiarlas.
            </p>
            <button
              className="btn btn-sm btn-outline mt-4 rounded-full"
              type="button"
              onClick={handleUploadClick}
            >
              Subir fotos
            </button>
            <input
              type="file"
              accept="image/*"
              multiple
              ref={fileInputRef}
              className="hidden"
              onChange={handleFilesSelected}
            />
          </div>
        )
      )}


      {hasImages && (
        <>
        {/* Imagen destacada SOLO en modo "main" */}
        {mode === "main" && (
          <div className="relative w-full aspect-[4/3] overflow-hidden rounded-lg mb-4">
            <img
              src={URL.createObjectURL(images[0])}
              alt="preview"
              className="w-full h-full object-cover"
            />
            <span className="absolute top-2 left-2 bg-secondary text-white text-xs px-2 py-1 rounded-full">
                Imagen destacada
              </span>
            <button
              className="absolute top-2 right-2 bg-black/50 p-1 rounded-full text-white"
              onClick={() => handleRemoveImage(0)}
            >
              <X size={16} />
            </button>
          </div>
        )}

          {/* Miniaturas (filtramos la primera si estamos en modo waypoint) */}
          <div className="flex gap-2 flex-wrap">
            {images.filter((_, i) => mode === "main" ? true : true)
              .map((img, i) => (
                <div key={i} className="relative w-20 h-20 rounded overflow-hidden">
                  <img
                    src={URL.createObjectURL(img)}
                    alt={`img-${i}`}
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={() => handleRemoveImage(i)}
                    className="absolute top-1 right-1 bg-black/50 p-0.5 rounded-full text-white"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}

            {/* Botón añadir imágenes */}
            <button
              type="button"
              className="w-20 h-20 flex items-center justify-center border border-neutral/30 rounded-md hover:bg-neutral/10 transition"
              onClick={handleUploadClick}
            >
              <ImagePlus size={20} />
            </button>

            <input
              type="file"
              accept="image/*"
              multiple
              ref={fileInputRef}
              className="hidden"
              onChange={handleFilesSelected}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default ForgeImages;
