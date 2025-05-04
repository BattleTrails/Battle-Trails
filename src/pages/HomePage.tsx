import Card from "@components/home/Card/Card.tsx";
import data from "@assets/fake_firestore_data.json";
import FilterBar from "@components/home/FilterBar/FilterBar.tsx";

const HomePage = () => {
    const posts = data.posts;
    return (
        <div className="flex flex-col items-center gap-14 p-6">
            <FilterBar/>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-14">

            {posts.map((post) => (
                    <Card key={post.id} post={post}/>
                ))}
            </div>
        </div>

    );
};

export default HomePage;
