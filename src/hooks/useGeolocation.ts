import { useState, useEffect } from 'react';
import { Geolocation } from '@capacitor/geolocation';
import { Capacitor } from '@capacitor/core';

interface GeolocationState {
  latitude: number | null;
  longitude: number | null;
  error: string | null;
  loading: boolean;
}

export const useGeolocation = () => {
  const [state, setState] = useState<GeolocationState>({
    latitude: null,
    longitude: null,
    error: null,
    loading: true
  });

  useEffect(() => {
    const getCurrentPosition = async () => {
      try {
        // Verificar si estamos en una plataforma nativa
        if (Capacitor.isNativePlatform()) {
          // Usar Capacitor Geolocation para móviles
          const coordinates = await Geolocation.getCurrentPosition();
          setState({
            latitude: coordinates.coords.latitude,
            longitude: coordinates.coords.longitude,
            error: null,
            loading: false
          });
        } else {
          // Usar Web API para navegadores
          if (!navigator.geolocation) {
            setState(prev => ({
              ...prev,
              error: 'Geolocalización no soportada en tu navegador',
              loading: false
            }));
            return;
          }

          navigator.geolocation.getCurrentPosition(
            (position) => {
              setState({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                error: null,
                loading: false
              });
            },
            (error) => {
              setState({
                latitude: null,
                longitude: null,
                error: 'No se pudo obtener tu ubicación',
                loading: false
              });
              console.error('Error al obtener la ubicación:', error);
            }
          );
        }
      
      } catch (error) {
        setState({
          latitude: null,
          longitude: null,
          error: 'Error al obtener la ubicación',
          loading: false
        });
        console.error('Error al obtener la ubicación:', error);
      }
    };

    getCurrentPosition();
  }, []);

  return state;
}; 