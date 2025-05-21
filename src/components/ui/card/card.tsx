import {Bookmark, Eye, Share2} from "lucide-react";
import mark from "@assets/iconslogo.svg"
import {Post} from "@/types";

const Card = ({post}: { post: Post }) => {
  const {title, /*description,*/ images, likes, likedBy} = post;

  return (
    <div
      className="relative w-70 h-96 rounded-2xl overflow-hidden shadow-md"
      style={{
        backgroundImage: `url(${images?.[0] || "/placeholder.jpg"})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Overlay oscuro */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent z-10"/>

      {/* Contenido sobre el fondo */}
      <div className="absolute inset-0 z-20 flex flex-col justify-end p-4 text-white ">
        <div className="flex flex-col justify-center items-center mb-4 gap-4 text-center">
          <h2 className="text-lg font-semibold line-clamp-2">{title}</h2>
          <div className="flex flex-row h-fit items-center gap-3">
            <img src={mark} alt="" className="h-5"/>
            <p className="text-sm opacity-90 line-clamp-2">Paris, Francia</p>
          </div>

        </div>

        <div className="flex justify-between text-sm">
          <div className="flex gap-4">
            <div className="flex items-center gap-1">
              <Eye size={18}/> {likedBy.length}
            </div>
            <div className="flex items-center gap-1">
              <Bookmark size={18}/> {likes}
            </div>
          </div>
          <Share2 size={18}/>
        </div>
      </div>
    </div>
  );
};

export default Card;
