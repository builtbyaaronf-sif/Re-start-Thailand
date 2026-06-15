import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ─── Storage helpers ───────────────────────────────────────────
const BUCKET = 'property-photos';

export const getPhotoUrl = (storagePath: string) =>
  `${supabaseUrl}/storage/v1/object/public/${BUCKET}/${storagePath}`;

export const uploadPhoto = async (file: File, propertyId: string, index: number) => {
  const ext = file.name.split('.').pop();
  const path = `${propertyId}/${index}-${Date.now()}.${ext}`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    cacheControl: '3600',
    upsert: false,
  });
  if (error) throw error;
  return path;
};

// ─── Exchange rate helper ──────────────────────────────────────
export const convertPrice = async (
  amount: number,
  from: 'EUR' | 'USD' | 'THB'
): Promise<{ eur: number; usd: number; thb: number }> => {
  // Approximate static rates as fallback
  const staticRates: Record<string, Record<string, number>> = {
    EUR: { EUR: 1, USD: 1.086, THB: 39 },
    USD: { EUR: 0.921, USD: 1, THB: 35.9 },
    THB: { EUR: 0.0256, USD: 0.0279, THB: 1 },
  };
  try {
    const res = await fetch(`https://api.exchangerate-api.com/v4/latest/${from}`);
    const data = await res.json();
    return {
      eur: Math.round(amount * data.rates.EUR),
      usd: Math.round(amount * data.rates.USD),
      thb: Math.round(amount * data.rates.THB),
    };
  } catch {
    const r = staticRates[from];
    return {
      eur: Math.round(amount * r.EUR),
      usd: Math.round(amount * r.USD),
      thb: Math.round(amount * r.THB),
    };
  }
};
