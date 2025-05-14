import Card from "@components/home/card/card.tsx";
import data from "@assets/fake_firestore_data.json";
import FilterBar from "@components/home/filter-bar/filter-bar.tsx";

const HomePage = () => {
    const posts = data.posts;


    return (
        <div className="flex flex-col items-center gap-5 p-6">
            <FilterBar/>
            <div className="grid grid-cols-1 pt-10 sm:grid-cols-2  lg:grid-cols-3 xl:grid-cols-4 {/*2xl:grid-cols-5*/} gap-20">
                {posts.map((post) => (
                    <Card key={post.id} post={post}/>

                ))}
            </div>
        </div>

    );
};

export default HomePage;
