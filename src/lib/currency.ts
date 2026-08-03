export const DEFAULT_FALLBACK_DOLLAR_RATE = 1510;
export const CACHE_KEY = 'aura_dollar_rate_cache';
export const CACHE_TTL_MS = 12 * 60 * 60 * 1000; // 12 horas

export interface DollarRateCache {
  rate: number;
  timestamp: number;
  source: 'dolarapi' | 'bluelytics' | 'fallback' | 'expired_cache';
}

export function getCachedDollarRate(): number | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const cache: DollarRateCache = JSON.parse(raw);
    if (typeof cache.rate === 'number' && cache.rate > 0) {
      const isExpired = Date.now() - cache.timestamp > CACHE_TTL_MS;
      if (!isExpired) {
        return cache.rate;
      }
    }
  } catch (err) {
    console.warn('Error reading dollar rate cache:', err);
  }
  return null;
}

export function getInitialDollarRate(): number {
  if (typeof window === 'undefined') return DEFAULT_FALLBACK_DOLLAR_RATE;
  
  const cached = getCachedDollarRate();
  if (cached) return cached;

  // Si existe cache vencido, usarlo de inmediato para evitar layout shift antes del fetch
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (raw) {
      const cache: DollarRateCache = JSON.parse(raw);
      if (typeof cache.rate === 'number' && cache.rate > 0) {
        return cache.rate;
      }
    }
  } catch (_) {}

  return DEFAULT_FALLBACK_DOLLAR_RATE;
}

export async function fetchDollarRate(): Promise<{ rate: number; source: DollarRateCache['source'] }> {
  // 1. Verificar cache vigente
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      if (raw) {
        const cache: DollarRateCache = JSON.parse(raw);
        if (typeof cache.rate === 'number' && cache.rate > 0 && Date.now() - cache.timestamp < CACHE_TTL_MS) {
          return { rate: cache.rate, source: cache.source };
        }
      }
    } catch (_) {}
  }

  // 2. API Primaria: DolarAPI (Oficial)
  try {
    const res = await fetch('https://dolarapi.com/v1/dolares/oficial', {
      headers: { Accept: 'application/json' },
    });
    if (res.ok) {
      const data = await res.json();
      const rate = Number(data.venta || data.compra);
      if (rate && !isNaN(rate) && rate > 0) {
        const cacheEntry: DollarRateCache = {
          rate,
          timestamp: Date.now(),
          source: 'dolarapi',
        };
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem(CACHE_KEY, JSON.stringify(cacheEntry));
          } catch (_) {}
        }
        return { rate, source: 'dolarapi' };
      }
    }
  } catch (err) {
    console.warn('DolarAPI fetch failed, intentando con API de respaldo...', err);
  }

  // 3. API Secundaria de respaldo: Bluelytics
  try {
    const res = await fetch('https://api.bluelytics.com.ar/v2/latest', {
      headers: { Accept: 'application/json' },
    });
    if (res.ok) {
      const data = await res.json();
      const rate = Number(data?.oficial?.value_sell || data?.oficial?.value_avg);
      if (rate && !isNaN(rate) && rate > 0) {
        const cacheEntry: DollarRateCache = {
          rate,
          timestamp: Date.now(),
          source: 'bluelytics',
        };
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem(CACHE_KEY, JSON.stringify(cacheEntry));
          } catch (_) {}
        }
        return { rate, source: 'bluelytics' };
      }
    }
  } catch (err) {
    console.warn('Bluelytics fetch failed...', err);
  }

  // 4. Retornar cache expirado si existe
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      if (raw) {
        const cache: DollarRateCache = JSON.parse(raw);
        if (typeof cache.rate === 'number' && cache.rate > 0) {
          return { rate: cache.rate, source: 'expired_cache' };
        }
      }
    } catch (_) {}
  }

  // 5. Fallback fijo
  return { rate: DEFAULT_FALLBACK_DOLLAR_RATE, source: 'fallback' };
}

export function formatArs(amount: number): string {
  return Math.round(amount).toLocaleString('es-AR');
}

export function calculatePlanPriceArs(priceUsd: number, dollarRate: number): {
  amount: number;
  formatted: string;
} {
  const amount = Math.round(priceUsd * dollarRate);
  return {
    amount,
    formatted: formatArs(amount),
  };
}
