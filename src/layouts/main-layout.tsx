import {Outlet} from "react-router-dom";
import Header from "@layouts/header/header";
import Footer from "@layouts/footer/footer";


const MainLayout = () => {

  const currentPath = location.pathname;
  const isHome = currentPath === "/";
  const isForge = currentPath.startsWith("/new");
  //const isDetails = currentPath.includes("/post/");

  const mainClass = isHome
    ? "bg-neutral text-neutral pt-[120px]"
    : isForge ? "  text-neutral pt-[75px] " : "";

  return (
    <div className={`flex flex-col min-h-screen  ${mainClass}`}>
      <Header/>
      <main className="flex-1  ">
        <Outlet/> {/* Renderiza las páginas */}
      </main>
      <Footer/>
    </div>
  );
};

export default MainLayout;
