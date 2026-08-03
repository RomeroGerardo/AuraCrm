import { useState, useEffect, useCallback } from 'react';
import {
  fetchDollarRate,
  getInitialDollarRate,
  calculatePlanPriceArs,
  formatArs,
  DEFAULT_FALLBACK_DOLLAR_RATE,
} from '@/lib/currency';

export function useDollarRate() {
  const [rate, setRate] = useState<number>(getInitialDollarRate);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [source, setSource] = useState<string>('initial');

  useEffect(() => {
    let isMounted = true;

    async function loadRate() {
      setIsLoading(true);
      try {
        const result = await fetchDollarRate();
        if (isMounted) {
          setRate(result.rate);
          setSource(result.source);
        }
      } catch (err) {
        console.error('Error fetching dollar rate in hook:', err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadRate();

    return () => {
      isMounted = false;
    };
  }, []);

  const calculatePriceArs = useCallback(
    (priceUsd: number) => calculatePlanPriceArs(priceUsd, rate || DEFAULT_FALLBACK_DOLLAR_RATE),
    [rate]
  );

  return {
    rate: rate || DEFAULT_FALLBACK_DOLLAR_RATE,
    isLoading,
    source,
    calculatePriceArs,
    formatArs,
  };
}
