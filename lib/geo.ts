export const BENGALURU_CENTER = { lat: 12.9716, lng: 77.5946 };

const AREA_COORDS: Record<string, { lat: number; lng: number }> = {
  koramangala: { lat: 12.9352, lng: 77.6245 },
  indiranagar: { lat: 12.9719, lng: 77.6412 },
  "hsr layout": { lat: 12.9116, lng: 77.6473 },
  jayanagar: { lat: 12.9299, lng: 77.5833 },
  whitefield: { lat: 12.9698, lng: 77.7499 },
  "electronic city": { lat: 12.8452, lng: 77.6602 },
  marathahalli: { lat: 12.9591, lng: 77.6974 },
  "jp nagar": { lat: 12.9077, lng: 77.5851 },
  malleshwaram: { lat: 13.0035, lng: 77.5647 },
  "banashankari": { lat: 12.925, lng: 77.5468 },
  hebbal: { lat: 13.0358, lng: 77.597 },
  rajajinagar: { lat: 12.9908, lng: 77.5526 },
  btm: { lat: 12.9166, lng: 77.6101 },
  "bellandur": { lat: 12.9257, lng: 77.6649 },
};

export function resolveArea(area?: string | null): { lat: number; lng: number } {
  if (!area) return BENGALURU_CENTER;
  const key = area.trim().toLowerCase();
  return AREA_COORDS[key] ?? BENGALURU_CENTER;
}

export function areaSuggestions(): string[] {
  return Object.keys(AREA_COORDS).map((k) => k.replace(/\b\w/g, (c) => c.toUpperCase()));
}
