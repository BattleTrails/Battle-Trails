import { useState, useEffect } from "react";
import { usePostStore } from "@/store/usePostStore";
import { ChevronLeft, MapPin, Edit3 } from "lucide-react";
import ForgeImages from "@pages/forge/forge-images/forge-images.tsx";

type Props = {
  onBack: () => void;
  onCreateRoute: () => void;
  isEditMode?: boolean;
  existingWaypointImages?: string[][];
  deletedWaypointImageUrls?: string[][];
  setDeletedWaypointImageUrls?: React.Dispatch<React.SetStateAction<string[][]>>;
};

const ForgeRouteEditor = ({ onBack, onCreateRoute, isEditMode = false, existingWaypointImages = [], setDeletedWaypointImageUrls  }: Props) => {
  const { postDraft, setWaypointDescription, setWaypointImages } = usePostStore();
  const [selectedWaypointIndex, setSelectedWaypointIndex] = useState(0);
  const [currentDescription, setCurrentDescription] = useState("");

  // Estado para manejar las imágenes existentes de cada waypoint
  const [waypointExistingImages, setWaypointExistingImages] = useState<string[][]>(existingWaypointImages);

  // Función helper para obtener descripción segura
  const getWaypointDescription = (index: number): string => {
    const waypoint = postDraft.routePoints?.[index];
    return waypoint?.description ?? "";
  };

  // Effect para inicializar y sincronizar la descripción cuando cambian los routePoints
  useEffect(() => {
    if (
      isEditMode &&
      existingWaypointImages.length > 0 &&
      postDraft.routePoints.length > 0
    ) {
      // Inicializar imágenes para todas las paradas
      setWaypointExistingImages(existingWaypointImages);

      // Inicializar descripción de la parada actual
      const description = getWaypointDescription(selectedWaypointIndex);
      setCurrentDescription(description);
    }
  }, [isEditMode, existingWaypointImages, postDraft.routePoints.length, selectedWaypointIndex]);



  const handleWaypointClick = (index: number) => {
    // Guardar descripción actual antes de cambiar
    if (selectedWaypointIndex !== -1 && postDraft.routePoints?.length > 0) {
      setWaypointDescription(selectedWaypointIndex, currentDescription);
    }

    // Cambiar a la nueva parada
    setSelectedWaypointIndex(index);
    const newDescription = getWaypointDescription(index);
    setCurrentDescription(newDescription);
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setCurrentDescription(value);

    // Solo actualizar si hay routePoints disponibles
    if (postDraft.routePoints?.length > 0) {
      setWaypointDescription(selectedWaypointIndex, value);
    }
  };

  // Función para manejar la eliminación de imágenes existentes
  const handleRemoveExistingImage = (waypointIndex: number, imageIndex: number) => {
    setWaypointExistingImages(prev => {
      const updated = [...prev];
      if (updated[waypointIndex]) {
        const waypointImages = [...updated[waypointIndex]];
        const imageToRemove = waypointImages[imageIndex];
        waypointImages.splice(imageIndex, 1);
        updated[waypointIndex] = waypointImages;

        if (setDeletedWaypointImageUrls) {
          setDeletedWaypointImageUrls(prev => {
            const updatedDel = [...prev];
            updatedDel[waypointIndex] = [...(updatedDel[waypointIndex] || []), imageToRemove];
            return updatedDel;
          });
        }
      }
      return updated;
    });
  };

  const handleCreateRoute = () => {
    // Guardar la descripción actual antes de crear la ruta
    if (postDraft.routePoints?.length > 0) {
      setWaypointDescription(selectedWaypointIndex, currentDescription);
    }
    onCreateRoute();
  };

  const getDescriptionProgress = () => {
    if (!postDraft.routePoints?.length) return "0/0";
    const withDescription = postDraft.routePoints.filter(point => point.description?.trim()).length;
    return `${withDescription}/${postDraft.routePoints.length}`;
  };
// Verificación extra: ¿tenemos imágenes cargadas para la parada actual?
  if (
    !waypointExistingImages[selectedWaypointIndex] &&
    isEditMode &&
    existingWaypointImages.length > 0
  ) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Cargando imágenes de la parada...</p>
      </div>
    );
  }

  // Verificación de seguridad
  if (!postDraft.routePoints?.length) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No hay paradas definidas en la ruta</p>
          <button
            onClick={onBack}
            className="btn btn-outline mt-4"
          >
            Volver al formulario
          </button>
        </div>
      </div>
    );
  }

  // Verificación adicional para el waypoint seleccionado
  const selectedWaypoint = postDraft.routePoints[selectedWaypointIndex];
  if (!selectedWaypoint) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-gray-500">Cargando parada...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-3">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="btn btn-ghost btn-circle"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-neutral">
              {isEditMode ? 'Editar las paradas' : 'Describe las paradas'}
            </h1>
            <p className="text-sm text-gray-500">
              Progreso: {getDescriptionProgress()} paradas descritas
            </p>
          </div>
        </div>

        <button
          onClick={handleCreateRoute}
          className="btn btn-neutral hover:bg-gray-300 hover:text-neutral rounded-full px-6"
        >
          {isEditMode ? 'Guardar cambios' : 'Crear ruta'}
        </button>
      </div>

      {/* Editor de doble columna */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-[550px]">
        {/* Panel izquierdo - Lista de paradas */}
        <div className="bg-base-200 rounded-xl p-4 overflow-y-auto">
          <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Paradas de la ruta
          </h2>

          <div className="space-y-2">
            {postDraft.routePoints.map((waypoint, index) => (
              <button
                key={index}
                onClick={() => handleWaypointClick(index)}
                className={`
                  w-full text-left p-4 rounded-lg border-2 transition-all duration-200
                  ${selectedWaypointIndex === index
                  ? 'border-primary bg-primary/10 shadow-md'
                  : 'border-transparent bg-base-100 hover:border-primary/30 hover:bg-base-300'
                }
                `}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="badge badge-primary badge-sm">
                        {index + 1}
                      </span>
                      <span className="font-medium truncate">
                        {waypoint.address || "Dirección no disponible"}
                      </span>
                    </div>

                    <p className="text-sm text-gray-500 line-clamp-2">
                      {waypoint.description && waypoint.description.trim()
                        ? waypoint.description
                        : "Sin descripción"}
                    </p>
                  </div>

                  <div className="ml-2">
                    {waypoint.description && waypoint.description.trim() ? (
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    ) : (
                      <Edit3 className="w-4 h-4 text-gray-400" />
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Panel derecho - Editor de descripción */}
        <div className="bg-base-100 rounded-xl p-4 border border-base-300">
          <div className="h-full flex flex-col">
            <div className="mb-4">
              <h3 className="font-semibold text-lg mb-2">
                Parada {selectedWaypointIndex + 1}: {selectedWaypoint.address || "Dirección no disponible"}
              </h3>
              <p className="text-sm text-gray-500">
                Describe qué pueden encontrar los visitantes en esta parada
              </p>
            </div>

            <div className="flex-1 flex flex-col">
              <textarea
                value={currentDescription}
                onChange={handleDescriptionChange}
                placeholder="Describe esta parada: historia, puntos de interés, recomendaciones..."
                className="textarea textarea-bordered flex-1 w-full resize-none text-base leading-relaxed"
                maxLength={800}
                style={{ minHeight: '200px' }}
              />

              <div className="flex justify-between items-center mt-3 text-sm text-gray-500">
                <span>
                  {currentDescription.length}/800 caracteres
                </span>
                <span className="text-xs">
                  {currentDescription.trim() ? '✓ Descripción añadida' : '⚠ Sin descripción'}
                </span>
              </div>

              <div className="mt-6">
                <h4 className="font-medium text-base mb-2 text-neutral">
                  {isEditMode ? 'Imágenes para esta parada' : 'Imágenes para esta parada'}
                </h4>
                <ForgeImages
                  images={selectedWaypoint.images || []}
                  setImages={(newImages) => setWaypointImages(selectedWaypointIndex, newImages)}
                  label={isEditMode
                    ? "Añadir más imágenes para esta parada"
                    : "Añade imágenes específicas para esta parada"
                  }
                  mode="waypoint"
                  existingImages={waypointExistingImages[selectedWaypointIndex] || []}
                  onRemoveExistingImage={(imageIndex) =>
                    handleRemoveExistingImage(selectedWaypointIndex, imageIndex)
                  }

                />
              </div>
            </div>

            {/* Navegación rápida */}
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => handleWaypointClick(Math.max(0, selectedWaypointIndex - 1))}
                disabled={selectedWaypointIndex === 0}
                className="btn btn-outline btn-sm flex-1"
              >
                ← Anterior
              </button>
              <button
                onClick={() => handleWaypointClick(Math.min(postDraft.routePoints.length - 1, selectedWaypointIndex + 1))}
                disabled={selectedWaypointIndex === postDraft.routePoints.length - 1}
                className="btn btn-outline btn-sm flex-1"
              >
                Siguiente →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgeRouteEditor;