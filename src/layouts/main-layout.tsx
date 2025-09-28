import {Outlet} from "react-router-dom";
import Header from "@layouts/header/header";
import Footer from "@layouts/footer/footer";
import { Capacitor } from '@capacitor/core';


const MainLayout = () => {

  const currentPath = location.pathname;
  const isHome = currentPath === "/";
  const isForge = currentPath.startsWith("/new") || currentPath.startsWith("/edit");
  const isMobileApp = Capacitor.isNativePlatform();
  //const isDetails = currentPath.includes("/post/");

  const mainClass = isHome
    ? `bg-neutral text-neutral ${isMobileApp ? "pt-[180px]" : "pt-[120px]"}` // Ajustar padding para móviles
    : isForge ? `text-neutral ${isMobileApp ? "pt-[135px]" : "pt-[75px]"}` : ""; // Ajustar padding para móviles

  return (
    <div className={`flex flex-col min-h-screen  ${mainClass}`}>
      <Header/>
      <main className="flex-1  ">
        <Outlet/> {/* Renderiza las páginas */}
      </main>
      {!isForge && <Footer/>}
    </div>
  );
};

export default MainLayout;
