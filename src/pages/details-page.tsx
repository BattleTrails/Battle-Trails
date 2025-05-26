const DetailsPage = () => {
    const images = [
      "https://images.pexels.com/photos/533881/pexels-photo-533881.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
      "https://images.pexels.com/photos/28277491/pexels-photo-28277491.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
      "https://images.pexels.com/photos/28428164/pexels-photo-28428164.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    ];
  
    return (
      <div className="flex h-screen -m-4">
        {/* Galería vertical con scroll */}
        <div className="w-[55%] h-screen overflow-y-scroll snap-y snap-mandatory">
          {images.map((src, index) => (
            <div
              key={index}
              className="h-screen w-full snap-start relative"
            >
              <img
                src={`${src}?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2`}
                alt={`Imagen ${index + 1}`}
                className="h-full w-full object-cover"
              />
            </div>
          ))}
        </div>
  
        {/* Contenido de texto fijo */}
        <div className="w-[45%] flex flex-col justify-center px-20">
          <h2 className="text-4xl font-bold mb-4">Batalla de Vukovar Croacia</h2>
  
          <p>
            Visitar Auschwitz no es un viaje cualquiera: es una experiencia de conciencia,
            respeto y memoria. Esta ruta te guía por los campos de concentración y exterminio
            de Auschwitz I y Auschwitz II-Birkenau, donde más de un millón de personas
            perdieron la vida durante el Holocausto. El recorrido incluye:
          </p>
  
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Las barracas originales y sus exposiciones</li>
            <li>El muro de fusilamiento y los crematorios</li>
            <li>El vagón de tren símbolo de las deportaciones</li>
            <li>Espacios de reflexión y homenaje a las víctimas</li>
          </ul>
  
          <div className="flex shadow px-4 rounded gap-8 items-center justify-between py-2 mt-6">
            <div className="flex items-center gap-2">
              <i className="text-xl"></i>
              <span>Polonia</span>
            </div>
            <div className="flex items-center gap-2">
              <i className="text-xl"></i>
              <span>8 km</span>
            </div>
            <div className="flex items-center gap-2">
              <i className="text-xl"></i>
              <span>7 horas</span>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  export default DetailsPage;
  