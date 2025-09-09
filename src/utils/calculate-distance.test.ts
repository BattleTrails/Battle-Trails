import { describe, it, expect } from 'vitest';
import { calculateDistance } from './calculate-distance';

describe('calculateDistance', () => {
  it('devuelve 0 para el mismo punto', () => {
    expect(calculateDistance(0, 0, 0, 0)).toBe(0);
  });

  it('calcula aproximadamente la distancia entre Madrid y Barcelona (~504 km)', () => {
    const madrid = { lat: 40.4168, lon: -3.7038 };
    const barcelona = { lat: 41.3874, lon: 2.1686 };
    const d = calculateDistance(madrid.lat, madrid.lon, barcelona.lat, barcelona.lon);
    expect(d).toBeGreaterThan(480);
    expect(d).toBeLessThan(530);
  });
});


