import {Outlet} from "react-router-dom";


const MainLayout = () => {
    return (
        <div className="flex flex-col min-h-screen">
            {/*<Header/>*/}
            <main className="flex-1 p-4">
                <Outlet/> {/* Renderiza las páginas */}
            </main>
            {/*<footer/>*/}
        </div>
    );
};

export default MainLayout;
