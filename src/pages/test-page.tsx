
import FilterBar from "@components/home/filter-bar/filter-bar.tsx";
import Card from "@components/home/card/card.tsx";
import data from "@/assets/fake_firestore_data.json";
import AuthForm from "@components/auth/auth-form/auth-form.tsx";
import Header from "@layouts/header/Header.tsx";

const TestPage = () => {
    const posts = data.posts;

    return (
        <div className="flex flex-col text-center">
            <div className="text-center p-6">
                <h1 className="text-3xl font-bold text-secondary">Página de Testeo de Componentes</h1>
                <p className="mt-2 text-lg">Esta página será dedicada al testeo de componentes en periodo de
                    maquetación</p>
            </div>

            <div className="flex-col gap-6 px-6  ">
                <div className="mb-4">
                    <p className="mb-2 font-semibold">Header with search bar:</p>
                    <Header/>
                </div>

                <div className="mb-4">
                    <p className="mb-2 font-semibold">Filter Bar with buttons:</p>
                    <FilterBar/>
                </div>

                <div className="mb-4">
                    <p className="mb-2 font-semibold">Grid de Cards:</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 justify-items-center">
                        {posts.map((post) => (
                            <Card key={post.id} post={post}/>

                        ))}
                    </div>
                </div>
                <div className=" flex flex-col  items-center justify-center ">
                    <p className="mb-2 font-semibold">Login/SignUp:</p>
                    <AuthForm/>
                </div>
            </div>
        </div>
    );
};

export default TestPage;
