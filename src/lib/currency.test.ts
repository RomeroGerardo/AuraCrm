import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  fetchDollarRate,
  calculatePlanPriceArs,
  formatArs,
  DEFAULT_FALLBACK_DOLLAR_RATE,
  CACHE_KEY,
  CACHE_TTL_MS,
  getCachedDollarRate,
  getInitialDollarRate
} from './currency';

describe('currency lib', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('calculates plan price in ARS accurately and formats with thousands separator', () => {
    expect(formatArs(39000)).toBe('39.000');
    expect(formatArs(59000)).toBe('59.000');

    const rate = 1500;
    const starter = calculatePlanPriceArs(19, rate);
    expect(starter.amount).toBe(28500);
    expect(starter.formatted).toBe('28.500');

    const pro = calculatePlanPriceArs(39, rate);
    expect(pro.amount).toBe(58500);
    expect(pro.formatted).toBe('58.500');

    const full = calculatePlanPriceArs(59, rate);
    expect(full.amount).toBe(88500);
    expect(full.formatted).toBe('88.500');
  });

  it('fetches rate from primary API (DolarAPI) and caches it in localStorage', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({ venta: 1520, compra: 1470 }),
    } as Response);

    const result = await fetchDollarRate();
    expect(result.rate).toBe(1520);
    expect(result.source).toBe('dolarapi');
    expect(fetchSpy).toHaveBeenCalledTimes(1);

    // Verify localStorage cache
    const cachedRaw = localStorage.getItem(CACHE_KEY);
    expect(cachedRaw).not.toBeNull();
    const cached = JSON.parse(cachedRaw!);
    expect(cached.rate).toBe(1520);
    expect(cached.source).toBe('dolarapi');

    // Second call should return cached value without fetching again
    const secondResult = await fetchDollarRate();
    expect(secondResult.rate).toBe(1520);
    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });

  it('falls back to secondary API (Bluelytics) if DolarAPI fails', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch')
      .mockRejectedValueOnce(new Error('DolarAPI Down')) // Primary fails
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ oficial: { value_sell: 1530 } }),
      } as Response); // Secondary succeeds

    const result = await fetchDollarRate();
    expect(result.rate).toBe(1530);
    expect(result.source).toBe('bluelytics');
    expect(fetchSpy).toHaveBeenCalledTimes(2);
  });

  it('falls back to DEFAULT_FALLBACK_DOLLAR_RATE if all APIs fail and no cache exists', async () => {
    vi.spyOn(globalThis, 'fetch')
      .mockRejectedValueOnce(new Error('DolarAPI Down'))
      .mockRejectedValueOnce(new Error('Bluelytics Down'));

    const result = await fetchDollarRate();
    expect(result.rate).toBe(DEFAULT_FALLBACK_DOLLAR_RATE);
    expect(result.source).toBe('fallback');
  });

  it('returns valid cached rate if available and not expired', () => {
    const cacheData = {
      rate: 1490,
      timestamp: Date.now() - 1000,
      source: 'dolarapi'
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));

    expect(getCachedDollarRate()).toBe(1490);
    expect(getInitialDollarRate()).toBe(1490);
  });

  it('ignores expired cache in getCachedDollarRate', () => {
    const cacheData = {
      rate: 1490,
      timestamp: Date.now() - (CACHE_TTL_MS + 10000),
      source: 'dolarapi'
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));

    expect(getCachedDollarRate()).toBeNull();
    // But getInitialDollarRate still uses it as initial baseline before background refresh
    expect(getInitialDollarRate()).toBe(1490);
  });
});
