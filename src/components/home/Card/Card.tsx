import {Eye, Bookmark, Share2} from "lucide-react";
import {Post} from "@/types";


const Card = ({post}: { post: Post }) => {
    const {title, description, images, likes, likedBy} = post;

    return (
        <div className="card bg-base-100 w-full max-w-sm rounded-field border border-neutral/20">

        <figure>
                <img
                    src={images.length > 0 ? images[0] : "/placeholder.jpg"}
                    alt={title}
                    className="object-cover h-48 w-full"
                />
            </figure>
            <div className="card-body gap-2.5">
                <h2 className="card-title">{title}</h2>
                <p>{description}</p>
                <div className="flex justify-between">
                    <div className="flex gap-2.5">
                        <div className="flex items-center gap-1">
                            <Eye size={18} strokeWidth={1.7}/> {likedBy.length}
                        </div>
                        <div className="flex items-center gap-1">
                            <Bookmark size={18} strokeWidth={1.7}/> {likes}
                        </div>
                    </div>
                    <div>
                        <Share2 size={18} strokeWidth={1.7}/>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Card;
