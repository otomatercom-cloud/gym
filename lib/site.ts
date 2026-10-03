'use client';
import { useEffect, useState } from 'react';

export type Site = {
  name?: string; tagline?: string; hero_title?: string; hero_subtitle?: string; about_text?: string; features?: string[];
  phone?: string; email?: string; address?: string; opening_hours?: string; logo?: string; images?: { id: number; caption: string; v: string }[];
};
let cache: Promise<Site> | null = null;
export const resetSite = () => { cache = null; };
export function useSite(): Site {
  const [s, setS] = useState<Site>({});
  useEffect(() => {
    if (!cache) cache = fetch('/api/site').then((r) => r.json()).catch(() => ({}));
    cache.then(setS);
  }, []);
  return s;
}
export const logoUrl = (s: Site) => (s.logo ? `/api/site/img?k=logo&v=${encodeURIComponent(s.logo)}` : '');
export const imgUrl = (i: { id: number; v: string }) => `/api/site/img?k=${i.id}&v=${encodeURIComponent(i.v)}`;
