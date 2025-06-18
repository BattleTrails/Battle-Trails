import React from "react";
import googlePlay from "@assets/googleplay.png";
import appStore from "@assets/appstore.png";

const Footer = () => {
  return (
    <footer className="bg-neutral text-neutral-100 px-10 sm:px-30 pt-10 pb-4 w-full relative overflow-hidden">
      <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-8">
        {/* Mensaje principal */}
        <div className="flex-1 flex flex-col text-center md:text-left">
          <h2 className="text-lg md:text-xl font-semibold mb-1">Tus rutas, tus experiencias, tus momentos.</h2>
          <p className="text-base md:text-lg font-normal">Sigue explorando y compartiendo con nosotros</p>
        </div>
        {/* Descarga App */}
        <div className="flex flex-col justify-center items-center md:items-end">
          <span className="mb-2 text-base">Descarga nuestra App</span>
          <div className="flex flex-row gap-2">
            <div className="flex flex-row gap-2">
              <img src={googlePlay} alt="Google Play" className="h-10" />
              <img src={appStore} alt="Apple Store" className="h-10" />
            </div>
            
          </div>
        </div>
      </div>
      {/* Línea divisoria */}
      <hr className="my-6 border-neutral-700" />
      <div className="flex flex-col md:flex-row  md:justify-between md:items-center text-xs text-neutral-400 gap-2">
        <div className="flex flex-row gap-6 mb-2 md:mb-0 justify-center sm:justify-start">
          <a href="" className="hover:text-accent transition-colors">Sobre nosotros</a>
          <a href="" className="hover:text-accent transition-colors">Centro de ayuda</a>
          <a href="/" className="hover:text-accent transition-colors">Explorar</a>
        </div>
        <div className="text-center sm:text-right">
          Copyright © {new Date().getFullYear()} - All right reserved
        </div>
      </div>
      
    </footer>
  );
};

export default Footer;