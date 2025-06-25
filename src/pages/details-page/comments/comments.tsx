import { useState } from "react";

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
    const [comment, setComment] = useState("");
    // Avatar de ejemplo, reemplazar por el del usuario autenticado si está disponible
    const userAvatar = "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2";

    return (
        <div>
            {/* Input para añadir comentario */}
            <div className="flex items-center gap-3 mb-8">
                <img
                    src={userAvatar}
                    alt="Tu avatar"
                    className="w-10 h-10 rounded-full object-cover border border-neutral-700"
                />
                <div className="relative flex-1">
                    <input
                        type="text"
                        value={comment}
                        onChange={e => setComment(e.target.value)}
                        placeholder="Añade un comentario..."
                        className="w-full bg-accent text-neutral-200 placeholder:text-neutral-400 border border-neutral-400 rounded px-4 py-2 pr-16 focus:outline-none focus:border-primary transition-colors"
                        maxLength={400}
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-neutral-400 select-none pointer-events-none">
                        {comment.length}/400
                    </span>
                </div>
                <button
                    className="ml-2 px-4 py-2 bg-primary text-white rounded disabled:opacity-50 transition-colors"
                    disabled={!comment.trim()}
                >
                    Comentar
                </button>
            </div>
            {/* Lista de comentarios */}
            <div className="grid grid-cols-1  gap-6">
                {mockComments.map((comment) => (
                    <div key={comment.id} className="flex items-start lg:items-center gap-x-4">
                        <div className="w-28 lg:w-20 aspect-square overflow-hidden rounded">
                            <img
                                src={comment.image}
                                alt={`foto de perfil de ${comment.name}`}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div className="w-full  flex flex-col">
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
