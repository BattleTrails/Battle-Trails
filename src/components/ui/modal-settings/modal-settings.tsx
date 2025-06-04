import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    X,
    GlobeLock,
    Info,
    MessageCircleQuestion,
    Database,
    Scale,
    LogOut,
    ChevronRight,
} from "lucide-react";

const tabs = [
    { id: "ayuda", label: "Ayuda", icon: Info },
    { id: "preguntasFrecuentes", label: "Preguntas Frecuentes", icon: MessageCircleQuestion },
    { id: "informaciónLegal", label: "Información legal", icon: Scale },
    { id: "políticaPrivacidad", label: "Política de privacidad", icon: GlobeLock },
    { id: "gestiónDatos", label: "Gestión de datos", icon: Database },
    { id: "cerrarSesión", label: "Cerrar Sesión", icon: LogOut },
];

const tabContent: Record<string, string> = {
    ayuda: `Bienvenido a Battle Trails, la app para amantes de la historia y las batallas. 
Aquí puedes crear y compartir rutas históricas de batallas famosas o menos conocidas. 
Si tienes dudas o problemas, nuestro equipo de soporte está disponible para ayudarte las 24 horas.`,

    preguntasFrecuentes: `1. ¿Cómo creo una nueva ruta histórica?
 - Ve a "Mis publicaciones" y selecciona "Crear ruta". Agrega título, descripción, fotos y puntos de interés.
2. ¿Puedo editar una ruta que ya subí?
 - Sí, accede a tu perfil, selecciona la ruta y usa la opción "Editar".
3. ¿Cómo puedo guardar rutas de otros usuarios?
 - En la página de la ruta, presiona "Guardar" para añadirla a tus rutas guardadas.
4. ¿Cómo cambio mi contraseña o datos personales?
 - En el menú de configuración, selecciona "Gestión de datos" para actualizar tu información.`,

    informaciónLegal: `Battle Trails es una plataforma para compartir contenido histórico. 
El contenido es responsabilidad de cada usuario. Respetamos la propiedad intelectual y solicitamos respetar las normas de uso.
Consulta nuestra política de privacidad para más detalles sobre la protección de tus datos personales.`,

    políticaPrivacidad: `En Battle Trails protegemos tus datos personales con los más altos estándares de seguridad.
No compartimos tu información con terceros sin tu consentimiento.
Puedes gestionar tus preferencias y eliminar tu cuenta en "Gestión de datos".`,

    gestiónDatos: `Desde aquí puedes actualizar tu correo electrónico, cambiar tu contraseña y gestionar tus preferencias de notificaciones.
También puedes solicitar la eliminación completa de tus datos personales y tu cuenta.`,

    cerrarSesión: `¿Listo para salir? Al cerrar sesión, tus datos permanecerán seguros y podrás volver a ingresar cuando quieras con tu usuario y contraseña.
Gracias por ser parte de Battle Trails.`,
};

interface ModalSettingsProps {
    showModal: boolean;
    setShowModal: (value: boolean) => void;
}

const ModalSettings = ({ showModal, setShowModal }: ModalSettingsProps) => {
    const [activeModalTab, setActiveModalTab] = useState<string | null>("ayuda");

    return (
        <div>
            <AnimatePresence>
                {showModal && (
                    <motion.div
                        className="fixed inset-0 bg-black/70 flex justify-center items-center z-50 p-4 text-left"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowModal(false)}
                    >
                        {/* Botón cerrar - Fijo arriba, fuera del modal */}
                        <button
                            onClick={(e) => { e.stopPropagation(); setShowModal(false); }}
                            className="absolute top-6 right-6 sm:top-4 sm:right-4 text-white z-50 "
                            aria-label="Cerrar modal"
                        >
                            <X className="size-6 sm:size-5" />
                        </button>

                        {/* Contenedor principal del modal */}
                        <motion.div
                            className="bg-white rounded-xl w-full max-w-4xl h-[500px] shadow-lg relative overflow-hidden sm:flex sm:flex-row"
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Menú lateral / acordeón */}
                            <div className="sm:w-1/3 rounded-l-xl sm:overflow-y-auto max-h-[500px] bg-white sm:bg-[#1E1E1E]">
                                {/* Desktop - Menú vertical */}
                                <div className="hidden sm:flex flex-col p-6 gap-4">
                                    {tabs.map(({ id, label, icon: Icon }) => (
                                        <button
                                            key={id}
                                            onClick={() => setActiveModalTab(id)}
                                            className={`flex items-center gap-2 px-4 py-2 rounded-md transition  text-left ${activeModalTab === id
                                                    ? "bg-white text-black font-semibold"
                                                    : "text-white hover:text-black/70 hover:bg-gray-100"
                                                }`}
                                        >
                                            <Icon className="size-4" />
                                            {label}
                                        </button>
                                    ))}
                                </div>

                                {/* Mobile - Acordeón */}
                                <div className="sm:hidden p-4 overflow-y-auto max-h-[500px]">
                                    {tabs.map(({ id, label, icon: Icon }) => {
                                        const isActive = activeModalTab === id;
                                        return (
                                            <div
                                                key={id}
                                                className="mb-3 border border-gray-200 rounded-md overflow-hidden"
                                            >
                                                <button
                                                    onClick={() => setActiveModalTab(isActive ? null : id)}
                                                    className="flex items-center justify-between w-full px-4 py-3 bg-gray-100 hover:bg-gray-200 text-left font-semibold text-gray-800"
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <Icon className="size-4" />
                                                        <span>{label}</span>
                                                    </div>
                                                    <motion.div
                                                        animate={{ rotate: isActive ? 90 : 0 }}
                                                        transition={{ duration: 0.2 }}
                                                        className="text-gray-500"
                                                    >
                                                        <ChevronRight size={16} />
                                                    </motion.div>
                                                </button>
                                                <AnimatePresence initial={false}>
                                                    {isActive && (
                                                        <motion.div
                                                            initial={{ height: 0, opacity: 0 }}
                                                            animate={{ height: "auto", opacity: 1 }}
                                                            exit={{ height: 0, opacity: 0 }}
                                                            transition={{ duration: 0.3 }}
                                                            className="px-4 py-3 text-gray-700 text-sm whitespace-pre-line bg-white text-left"
                                                        >
                                                            {tabContent[id]}
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Contenido derecho (solo desktop) */}
                            <div className="hidden sm:block sm:w-2/3 p-6 overflow-y-auto max-h-[500px]">
                                <motion.h2
                                    key={activeModalTab}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className="text-2xl font-bold mb-4"
                                >
                                    {tabs.find((t) => t.id === activeModalTab)?.label}
                                </motion.h2>
                                <motion.p
                                    key={activeModalTab + "_content"}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.1 }}
                                    className="text-gray-700 whitespace-pre-line text-left"
                                >
                                    {tabContent[activeModalTab || "ayuda"]}
                                </motion.p>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ModalSettings;
