import { useState, useEffect, useRef } from "react";
import { MapPin, ChevronLeft, ChevronRight, X } from "lucide-react";

type Waypoint = {
  geoPoint: {
    latitude: number;
    longitude: number;
  };
  address: string;
  description?: string;
  images?: string[];
};

type Props = {
  waypoints: Waypoint[];
};

const RouteTimeline = ({ waypoints }: Props) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [modalImage, setModalImage] = useState<string | null>(null);
  const mobileTimelineRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Intersection Observer para activar animaciones
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Scroll handler para mobile
  useEffect(() => {
    const handleScroll = () => {
      if (!mobileTimelineRef.current) return;

      const container = mobileTimelineRef.current;
      const scrollTop = container.scrollTop;
      const itemHeight = container.scrollHeight / waypoints.length;
      const newIndex = Math.floor(scrollTop / itemHeight);

      if (newIndex !== activeIndex && newIndex >= 0 && newIndex < waypoints.length) {
        setActiveIndex(newIndex);
      }
    };

    const container = mobileTimelineRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll);
      return () => container.removeEventListener("scroll", handleScroll);
    }
  }, [activeIndex, waypoints.length]);

  // Cerrar modal con ESC
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setModalImage(null);
      }
    };

    if (modalImage) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [modalImage]);

  const handleStepClick = (index: number) => setActiveIndex(index);
  const handlePrevious = () => setActiveIndex((prev) => (prev - 1 + waypoints.length) % waypoints.length);
  const handleNext = () => setActiveIndex((prev) => (prev + 1) % waypoints.length);

  if (!waypoints.length) return null;

  const currentWaypoint = waypoints[activeIndex];
  const currentDescription =
    currentWaypoint?.description ??
    "Esta parada forma parte de una experiencia única que te permitirá conocer mejor la zona y sus atractivos.";

  return (
    <>
      <div ref={containerRef} className="py-16 bg-gray-100 min-h-[100vh]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Descubre cada parada de esta ruta</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Explora todos los puntos de interés y conoce la historia detrás de cada ubicación
            </p>
          </div>

          {/* Desktop */}
          <div className="hidden lg:block">
            <div className="grid grid-cols-2 gap-20 items-start">
              {/* Contenido de la parada activa */}
              <div className="space-y-6 md:pl-5">
                <div
                  className={`transition-all duration-700 ease-out ${
                    isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-8"
                  }`}
                  style={{ transitionDelay: "200ms" }}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="bg-secondary text-white rounded-full w-8 h-8 flex items-center justify-center font-semibold">
                      {activeIndex + 1}
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900">{currentWaypoint?.address}</h3>
                  </div>
                  <p className="text-gray-700 text-lg text-justify leading-relaxed mb-6">{currentDescription}</p>

                  {/* Grid de imágenes */}
                  {currentWaypoint?.images && currentWaypoint.images.length > 0 && (
                    <div className="grid grid-cols-4 gap-3 mb-6">
                      {currentWaypoint.images.slice(0, 4).map((image, imgIndex) => (
                        <div
                          key={imgIndex}
                          className="aspect-square rounded-lg overflow-hidden cursor-pointer transform transition-transform hover:scale-105 shadow-md hover:shadow-lg"
                          onClick={() => setModalImage(image)}
                        >
                          <img
                            src={image}
                            alt={`${currentWaypoint.address} - Imagen ${imgIndex + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-4 pt-4">
                  <button
                    aria-label="Anterior parada"
                    onClick={handlePrevious}
                    className="p-2 rounded-full bg-white shadow-md hover:shadow-lg transition-shadow duration-200 hover:bg-gray-50"
                    disabled={waypoints.length <= 1}
                  >
                    <ChevronLeft className="w-5 h-5 text-gray-600" />
                  </button>

                  <span className="text-sm font-medium text-gray-500">
                    {activeIndex + 1} de {waypoints.length}
                  </span>

                  <button
                    aria-label="Siguiente parada"
                    onClick={handleNext}
                    className="p-2 rounded-full bg-white shadow-md hover:shadow-lg transition-shadow duration-200 hover:bg-gray-50"
                    disabled={waypoints.length <= 1}
                  >
                    <ChevronRight className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
              </div>

              {/* Timeline visual */}
              <div className="relative">
                <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-300"></div>
                <div
                  className="absolute left-8 top-0 w-0.5 bg-secondary transition-all duration-1000 ease-out"
                  style={{
                    height: `${((activeIndex + 1) / waypoints.length) * 100}%`,
                    transitionDelay: isVisible ? "500ms" : "0ms"
                  }}
                ></div>

                <div className="space-y-6">
                  {waypoints.map((waypoint, index) => (
                    <div
                      key={index}
                      className={`relative flex items-center cursor-pointer transition-all duration-300 ${
                        index <= activeIndex ? "opacity-100" : "opacity-60"
                      }`}
                      onClick={() => handleStepClick(index)}
                      style={{ transitionDelay: isVisible ? `${index * 100 + 300}ms` : "0ms" }}
                    >
                      <div
                        className={`relative z-10 w-4 h-4 rounded-full border-4 transition-all duration-300 ${
                          index === activeIndex
                            ? "bg-secondary border-secondary shadow-lg scale-125"
                            : index < activeIndex
                              ? "bg-secondary border-secondary"
                              : "bg-white border-gray-300"
                        }`}
                      >
                        {index < activeIndex && (
                          <div className="absolute inset-0 rounded-full bg-secondary animate-ping opacity-20"></div>
                        )}
                      </div>

                      <div
                        className={`ml-6 p-3 bg-white rounded-lg shadow transition-all duration-300 hover:shadow-md min-w-0 flex-1 ${
                          index === activeIndex
                            ? "border-2 border-secondary shadow-lg"
                            : "border border-gray-200"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <MapPin
                            className={`w-4 h-4 mt-2 flex-shrink-0 transition-colors duration-300 ${
                              index === activeIndex ? "text-secondary" : "text-gray-400"
                            }`}
                          />
                          <div className="min-w-0">
                            <h4 className="font-semibold text-gray-900 mb-1 text-sm">{waypoint.address} <span className="text-xs text-gray-600 line-clamp-2">Parada {index + 1}</span></h4>

                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Mobile */}
          <div className="block lg:hidden relative h-[80vh]">
            <div className="absolute left-4 top-0 bottom-0 rounded w-1 bg-gray-300 z-0"></div>
            <div className="absolute left-4 top-0 w-1 bg-secondary rounded z-10 mobile-progress-bar transition-all duration-200" style={{ height: "0%" }}></div>

            <div
              ref={mobileTimelineRef}
              className="h-full overflow-y-auto pl-12 pr-4"
              onScroll={(e) => {
                const container = e.currentTarget;
                const scrollTop = container.scrollTop;
                const scrollHeight = container.scrollHeight - container.clientHeight;
                const progress = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;

                const progressBar = document.querySelector(".mobile-progress-bar") as HTMLDivElement;
                if (progressBar) {
                  progressBar.style.height = `${progress}%`;
                }
              }}
            >
              <div className="space-y-8 pb-12">
                {waypoints.map((waypoint, index) => (
                  <div key={index} className="bg-white p-4 rounded-lg border-gray-200">
                    <h4 className="text-base font-semibold text-gray-900 mb-1">Parada {index + 1}</h4>
                    <p className="text-sm text-gray-600 mb-2">{waypoint.address}</p>
                    <p className=" text-sm text-gray-700 text-justify mb-3 ">
                      {waypoint.description ??
                        "Esta parada forma parte de una experiencia única que te permitirá conocer mejor la zona y sus atractivos."}
                    </p>

                    {/* Grid de imágenes mobile */}
                    {waypoint.images && waypoint.images.length > 0 && (
                      <div className="grid grid-cols-4 gap-2">
                        {waypoint.images.slice(0, 4).map((image, imgIndex) => (
                          <div
                            key={imgIndex}
                            className="aspect-square rounded-md overflow-hidden cursor-pointer"
                            onClick={() => setModalImage(image)}
                          >
                            <img
                              src={image}
                              alt={`${waypoint.address} - Imagen ${imgIndex + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {modalImage && (
        <div
          className="fixed inset-0 bg-black/30 bg-opacity-30 z-50 flex items-center justify-center p-4"
          onClick={() => setModalImage(null)}
        >
          <div className="relative top-0 max-w-4xl  w-fit">
            <button
              onClick={() => setModalImage(null)}
              className="absolute top-2 right-2 text-white hover:text-gray-300 transition-colors"
              aria-label="Cerrar modal"
            >
              <X className="w-8 h-8" />
            </button>
            <img
              src={modalImage}
              alt="Imagen ampliada"
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default RouteTimeline;