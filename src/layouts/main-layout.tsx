import {Outlet} from "react-router-dom";
import Header from "@layouts/header/header";
import Footer from "@layouts/footer/footer";


const MainLayout = () => {

  const currentPath = location.pathname;
  const isHome = currentPath === "/";
  const isForge = currentPath.startsWith("/new");
  //const isDetails = currentPath.includes("/post/");

  const mainClass = isHome
    ? "bg-neutral text-neutral"
    : isForge ? "  text-neutral  " : "";

  return (
    <div className={`flex flex-col min-h-screen  ${mainClass}`}>
      <Header/>
      <main className="flex-1 pt-[70px] ">
        <Outlet/> {/* Renderiza las páginas */}
      </main>
      <Footer/>
    </div>
  );
};

export default MainLayout;
