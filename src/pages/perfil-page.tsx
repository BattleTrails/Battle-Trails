import { useState } from "react";
import { Settings, Share2, X, GlobeLock, Info, MessageCircleQuestion, Database, Scale, LogOut, CircleFadingPlus, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import ModalSettings from "@/components/ui/modal-settings/modal-settings";

const PerfilPage = () => {
    const [activeTab, setActiveTab] = useState<"guardados" | "publicaciones">("publicaciones");
    const [showModal, setShowModal] = useState(false);
    const [activeModalTab, setActiveModalTab] = useState<string | null>("ayuda");

    const user = {
        username: "Karen_García",
        fullName: "Karen García",
        image:
            "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    };

    return (
        <div className="px-4 sm:px-10">
            {/* Header */}
            <div className="flex flex-col lg:flex-row flex-wrap gap-6 items-center">
                <div className="w-28 lg:w-20 aspect-square overflow-hidden rounded">
                    <img src={user.image} alt={`foto de perfil de ${user.fullName}`} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-[150px] text-center lg:text-start">
                    <h2 className="text-2xl sm:text-4xl font-bold mb-1">{user.username}</h2>
                    <span className="text-lg sm:text-xl">{user.fullName}</span>
                    <div className="flex flex-wrap gap-3 mt-3">
                        <button className="border border-b-blue-950 text-blue-950 px-3 py-1 rounded-md text-sm sm:text-base">Editar perfil</button>
                        <button onClick={() => setShowModal(true)} className="bg-blue-950 p-1.5 rounded-md">
                            <Settings color="white" strokeWidth={1} className="size-5" />
                        </button>
                        <button className="bg-blue-950 p-1.5 rounded-md">
                            <Share2 color="white" strokeWidth={1} className="size-5" />
                        </button>
                    </div>
                    <ModalSettings showModal={showModal} setShowModal={setShowModal} />
                </div>
            </div>

            {/* Tabs principales */}
            <div className="flex gap-x-2 bg-gray-200 w-fit px-4 mt-5 rounded py-1 mx-auto lg:hidden">
                <span>Añade tu ruta</span>
                <CircleFadingPlus />
            </div>

            <div className="flex flex-col lg:flex-row items-center lg:items-end relative mt-5 mb-10">
                <div className="relative mt-8 flex gap-x-10 text-lg sm:text-xl overflow-x-auto no-scrollbar">
                    {["guardados", "publicaciones"].map((tab) => (
                        <motion.button
                            key={tab}
                            onClick={() => setActiveTab(tab as "guardados" | "publicaciones")}
                            className={`relative pb-1 transition-colors duration-300 whitespace-nowrap ${activeTab === tab ? "text-black font-medium" : "text-gray-500"
                                }`}
                            whileTap={{ scale: 0.95 }}
                        >
                            {tab === "guardados" ? "Guardados" : "Mis publicaciones"}
                            {activeTab === tab && (
                                <motion.div
                                    layoutId="underline"
                                    className="absolute bottom-0 left-0 w-full h-0.5 bg-black rounded"
                                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                />
                            )}
                        </motion.button>
                    ))}
                </div>

                <Link
                    to="/new"
                    className="lg:absolute left-1/2 -translate-x-1/2 mx-auto lg:mt-0 mt-5 hidden lg:block"
                    aria-label="Añadir nueva ruta"
                >
                    <CircleFadingPlus />
                </Link>
            </div>
            {/* Contenido */}
            <div className="mt-5">
                {activeTab === "guardados" ? (
                    <p className="text-center lg:text-start text-base sm:text-lg text-gray-700">Aquí se mostrarán tus rutas guardadas.</p>
                ) : (
                    <p className="text-center lg:text-start text-base sm:text-lg text-gray-700">Aquí se mostrarán tus publicaciones.</p>
                )}
            </div>            
        </div>
    );
};

export default PerfilPage;
