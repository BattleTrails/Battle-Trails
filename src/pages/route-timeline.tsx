import { useState, useEffect, useRef } from "react";
import { MapPin, ChevronLeft, ChevronRight } from "lucide-react";

type Waypoint = {
  geoPoint: {
    latitude: number;
    longitude: number;
  };
  address: string;
  description?: string;
};

type Props = {
  waypoints: Waypoint[];
};

const RouteTimeline = ({ waypoints }: Props) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
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



  // Scroll handler para mobile (solo se registra una vez)
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
  }, [waypoints.length]); // solo depende del número de waypoints

  const handleStepClick = (index: number) => setActiveIndex(index);
  const handlePrevious = () => setActiveIndex((prev) => (prev - 1 + waypoints.length) % waypoints.length);
  const handleNext = () => setActiveIndex((prev) => (prev + 1) % waypoints.length);

  if (!waypoints.length) return null;

  const currentDescription =
    waypoints[activeIndex]?.description ??
    "Esta parada forma parte de una experiencia única que te permitirá conocer mejor la zona y sus atractivos.";

  return (
    <div ref={containerRef} className="py-16 bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Descubre cada parada de esta ruta</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Explora todos los puntos de interés y conoce la historia detrás de cada ubicación
          </p>
        </div>

        {/* Desktop */}
        <div className="hidden md:block">
          <div className="grid grid-cols-2 gap-12 items-center">
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
                  <h3 className="text-2xl font-bold text-gray-900">{waypoints[activeIndex]?.address}</h3>
                </div>
                <p className="text-gray-700 text-lg leading-relaxed">{currentDescription}</p>
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

              <div className="space-y-8">
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
                      className={`ml-6 p-4 bg-white rounded-lg shadow transition-all duration-300 hover:shadow-md ${
                        index === activeIndex
                          ? "border-2 border-secondary shadow-lg"
                          : "border border-gray-200"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <MapPin
                          className={`w-5 h-5 mt-0.5 transition-colors duration-300 ${
                            index === activeIndex ? "text-secondary" : "text-gray-400"
                          }`}
                        />
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-1">Parada {index + 1}</h4>
                          <p className="text-sm text-gray-600 line-clamp-2">{waypoint.address}</p>
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
        <div className="block lg:hidden relative h-[500px]">
          {/* Línea de fondo (fija) */}
          <div className="absolute left-4 top-0 bottom-0 rounded w-1 bg-gray-300 z-0"></div>

          {/* Línea de progreso (fija, sobrepuesta) */}
          <div className="absolute left-4 top-0 w-1 bg-secondary rounded z-10 mobile-progress-bar transition-all duration-200" style={{ height: "0%" }}></div>

          {/* Scroll contenido */}
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
                <div key={index} className="bg-white p-4 rounded-lg  border-gray-200">
                  <h4 className="text-base font-semibold text-gray-900 mb-1">Parada {index + 1}</h4>
                  <p className="text-sm text-gray-600 mb-1">{waypoint.address}</p>
                  <p className="text-sm text-gray-700">
                    {waypoint.description ??
                      "Esta parada forma parte de una experiencia única que te permitirá conocer mejor la zona y sus atractivos."}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>






      </div>
    </div>
  );
};

export default RouteTimeline;
