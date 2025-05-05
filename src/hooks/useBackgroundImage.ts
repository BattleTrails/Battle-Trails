import { useEffect, useMemo, useState } from "react";

const images = import.meta.glob("../assets/authimgs/*.webp", { eager: true });
const imageUrls = Object.values(images as Record<string, { default: string }>).map((mod) => mod.default);

export const useBackgroundImage = () => {
    const image = useMemo(() => {
        return imageUrls[Math.floor(Math.random() * imageUrls.length)];
    }, []);

    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        if (!image) return;
        const preload = new Image();
        preload.src = image;
        if (preload.complete) {
            setIsLoaded(true);
        } else {
            preload.onload = () => setIsLoaded(true);
        }
    }, [image]);

    return {
        image,
        isLoaded,
    };
};
