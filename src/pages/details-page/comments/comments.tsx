const mockComments = [
    {
        id: 1,
        name: "Jenny Wilson",
        text: "We love Landingfolio! Our designers were using it for their projects, so we already knew what kind of design they want.",
        image: "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    },
    {
        id: 2,
        name: "Devon Lane",
        text: "We love Landingfolio! Our designers were using it for their projects, so we already knew what kind of design they want.",
        image: "https://images.pexels.com/photos/1371360/pexels-photo-1371360.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    },
    {
        id: 3,
        name: "Devon Lane",
        text: "We love Landingfolio! Our designers were using it for their projects, so we already knew what kind of design they want.",
        image: "https://images.pexels.com/photos/3452877/pexels-photo-3452877.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    },
    {
        id: 4,
        name: "Jenny Wilson",
        text: "We love Landingfolio! Our designers were using it for their projects, so we already knew what kind of design they want.",
        image: "https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    },
];

const Comments = () => {
    return (
        <div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {mockComments.map((comment) => (
                    <div key={comment.id} className="flex items-start lg:items-center gap-x-4">
                        <div className="w-28 lg:w-50 aspect-square overflow-hidden rounded">
                            <img
                                src={comment.image}
                                alt={`foto de perfil de ${comment.name}`}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div className="w-full lg:w-[50%] flex flex-col">
                            <p className="font-light lg:font-medium order-1 lg:order-2 mt-1 lg:mt-2 text-sm lg:text-base">"{comment.text}"</p>
                            <h3 className="font-medium lg:font-light order-2 lg:order-1">{comment.name}</h3>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Comments;
