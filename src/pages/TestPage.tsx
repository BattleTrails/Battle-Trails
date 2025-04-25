import Header from "@layouts/Header/Header";
import FilterBar from "@components/home/FilterBar/FilterBar";

const TestPage = () => {
    return (
        <div className="flex-col">
            <div className="text-center p-6">
                <h1 className="text-3xl font-bold text-secondary">Página de Testeo de Componentes</h1>
                <p className="mt-2 text-lg">Esta pagina sera dedicada al testeo de componentes en periodo de
                    maquetacion</p>
            </div>
            <div className="flex-col">
                Header with search bar:
                <Header/>
                Filter Bar with buttons:
                <FilterBar/>
            </div>
        </div>

    );

}
export default TestPage;