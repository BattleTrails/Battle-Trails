import Header from "@layouts/Header/Header";
import FilterBar from "@components/home/FilterBar/FilterBar";
import Card from "@components/Card/Card";
import data from "@/assets/fake_firestore_data.json";

const TestPage = () => {
    const posts = data.posts;

    return (
        <div className="flex-col">
            <div className="text-center p-6">
                <h1 className="text-3xl font-bold text-secondary">Página de Testeo de Componentes</h1>
                <p className="mt-2 text-lg">Esta página será dedicada al testeo de componentes en periodo de
                    maquetación</p>
            </div>

            <div className="flex-col gap-6 px-6">
                <div className="mb-4">
                    <p className="mb-2 font-semibold">Header with search bar:</p>
                    <Header />
                </div>

                <div className="mb-4">
                    <p className="mb-2 font-semibold">Filter Bar with buttons:</p>
                    <FilterBar />
                </div>

                <div className="mb-4">
                    <p className="mb-2 font-semibold">Grid de Cards:</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 justify-items-center">
                        {posts.map((post) => (
                            <Card
                                key={post.id}
                                title={post.title}
                                description={post.description}
                                imageUrl={post.images[0] ?? "https://placehold.co/600x400?text=Sin+imagen"}
                                views={Math.floor(Math.random() * 300)} // temporal: simula visitas
                                likes={post.likes}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TestPage;
