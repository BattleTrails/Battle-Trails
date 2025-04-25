import { Eye, Bookmark, Share2 } from "lucide-react";
type CardProps = {
    title: string;
    description: string;
    imageUrl: string;
    views: number;
    likes: number;
};

const Card = ({ title, description, imageUrl, views, likes }: CardProps) => {
    return (
        <div className={`card bg-base-100 w-96 rounded-field border border-neutral/20 `}>
            <figure>
                <img src={imageUrl} alt={title} />
            </figure>
            <div className="card-body gap-2.5">
                <h2 className="card-title">{title}</h2>
                <p>{description}</p>
                <div className="flex justify-between">
                    <div className="flex gap-2.5">
                        <div className="flex items-center gap-1">
                            <Eye size={18} strokeWidth={1.7} /> {views}
                        </div>
                        <div className="flex items-center gap-1">
                            <Bookmark size={18} strokeWidth={1.7} /> {likes}
                        </div>
                    </div>
                    <div>
                        <Share2 size={18} strokeWidth={1.7} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Card;
