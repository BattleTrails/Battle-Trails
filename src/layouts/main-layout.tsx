import {Outlet} from "react-router-dom";
import Header from "@layouts/header/header";
import Footer from "@layouts/footer/Footer";




const MainLayout = () => {
    return (
        <div className="flex flex-col min-h-screen">
            <Header/>
            <main className="flex-1 pt-[100px] p-4">
                <Outlet/> {/* Renderiza las páginas */}
            </main>
            <Footer/>
        </div>
    );
};

export default MainLayout;
