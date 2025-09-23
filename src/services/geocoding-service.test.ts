import { describe, it, expect, beforeEach, afterAll, vi } from 'vitest';
import {
  geocodeAddress,
  reverseGeocode,
  searchPlaces,
  clearGeocodingCache
} from './geocoding-service';

const originalFetch = global.fetch;

describe('geocoding-service', () => {
  beforeEach(() => {
    clearGeocodingCache();
    vi.useRealTimers();
  });

  it('devuelve [] si la dirección está vacía o solo espacios', async () => {
    expect(await geocodeAddress('')).toEqual([]);
    expect(await geocodeAddress('   ')).toEqual([]);
  });

  it('usa caché para la misma dirección', async () => {
    const mockResponse = [{
      place_id: 1,
      display_name: 'Calle Falsa 123, Madrid',
      lat: '40.1',
      lon: '-3.6',
      type: 'house',
      importance: 0.5,
      address: { road: 'Calle Falsa', house_number: '123', city: 'Madrid', country: 'España' }
    }];

    global.fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => mockResponse });

    const a = await geocodeAddress('Calle Falsa 123');
    const b = await geocodeAddress('Calle Falsa 123');

    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(a[0].displayName).toContain('Calle Falsa');
    expect(b[0].displayName).toContain('Calle Falsa');
  });

  it('reverseGeocode devuelve fallback si hay error http', async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 500, statusText: 'Err' });
    const text = await reverseGeocode(40.123456, -3.654321);
    expect(text).toBe('40.123456, -3.654321');
  });

  it('searchPlaces devuelve [] si query corta o vacía', async () => {
    expect(await searchPlaces('')).toEqual([]);
    expect(await searchPlaces('  ')).toEqual([]);
    expect(await searchPlaces('ab')).toEqual([]);
  });

  afterAll(() => {
    global.fetch = originalFetch;
  });
});


