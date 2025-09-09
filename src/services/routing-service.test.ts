import { describe, it, expect, vi, afterAll } from 'vitest';
import { fetchDrivingRoute } from './routing-service';

const originalFetch = global.fetch;

describe('routing-service', () => {
  it('lanza error si hay menos de dos waypoints', async () => {
    await expect(fetchDrivingRoute([] as any)).rejects.toThrow(/al menos 2 puntos/);
  });

  it('parsea una respuesta OSRM válida', async () => {
    const mockData = {
      code: 'Ok',
      routes: [{
        geometry: { coordinates: [[-3.7, 40.4], [-3.6, 40.5]] },
        legs: [
          { distance: 1000, duration: 120 },
          { distance: 2000, duration: 240 }
        ]
      }]
    };

    global.fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => mockData });

    const route = await fetchDrivingRoute([
      { latitude: 40.4, longitude: -3.7 } as any,
      { latitude: 40.5, longitude: -3.6 } as any
    ]);

    expect(route.coordinates.length).toBe(2);
    expect(route.total.distanceMeters).toBe(3000);
    expect(route.total.durationSeconds).toBe(360);
    expect(route.legs).toHaveLength(2);
  });

  it('propaga error http', async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 500, statusText: 'Err' });
    await expect(fetchDrivingRoute([
      { latitude: 40.4, longitude: -3.7 } as any,
      { latitude: 40.5, longitude: -3.6 } as any
    ])).rejects.toThrow(/Error de routing OSRM/);
  });

  afterAll(() => {
    global.fetch = originalFetch;
  });
});


