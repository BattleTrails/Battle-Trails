import {useRef} from "react";
import {usePostStore} from "@/store/usePostStore.ts";
import {compressImages} from "@/utils/compress-images.ts";
import {ImagePlus, X} from "lucide-react";

const ForgeImages = () => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const {postDraft, setImages} = usePostStore();

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFilesSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawFiles = Array.from(e.target.files || []);
    const compressed = await compressImages(rawFiles);
    setImages([...postDraft.images, ...compressed]);
  };

  const handleRemoveImage = (index: number) => {
    const updated = [...postDraft.images];
    updated.splice(index, 1);
    setImages(updated);
  };

  const hasImages = postDraft.images.length > 0;

  return (
    <div className="bg-neutral/5 rounded-lg border border-dashed border-neutral/30 p-4">
      {!hasImages && (
        <div className="flex flex-col items-center gap-2 justify-center text-center min-h-[400px]">

          <ImagePlus/>

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

          <input
            type="file"
            accept="image/*"
            multiple
            ref={fileInputRef}
            className="hidden"
            onChange={handleFilesSelected}
          />
        </div>
      )}

      {hasImages && (
        <>
          {/* Imagen destacada */}
          <div className="relative w-full aspect-square overflow-hidden rounded-lg">
            <img
              src={URL.createObjectURL(postDraft.images[0])}
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
              <X size={16}/>
            </button>
          </div>

          {/* Miniaturas */}
          <div className="flex gap-2 mt-4">
            {postDraft.images.map((img, i) => (
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
                  <X size={12}/>
                </button>
              </div>
            ))}

            {/* Botón añadir más */}
            <button
              type="button"
              className="w-20 h-20 flex items-center justify-center border border-neutral/30 rounded-md hover:bg-neutral/10 transition"
              onClick={handleUploadClick}
            >
              <ImagePlus size={20}/>
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
