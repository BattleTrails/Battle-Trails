import { useEffect, useRef, useState } from "react";

// Importar imágenes automáticamente
const images = import.meta.glob("../assets/authimgs/*.png", { eager: true });
const imageUrls = Object.values(images as Record<string, { default: string }>)
    .map((mod) => mod.default);

export const useBackgroundImage = () => {
    const imageRef = useRef<string>(
        imageUrls[Math.floor(Math.random() * imageUrls.length)]
    );

    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const preload = new Image();
        preload.src = imageRef.current;
        preload.onload = () => setIsLoaded(true);
    }, []);

    return {
        image: imageRef.current,
        isLoaded,
    };
};
