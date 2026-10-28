/**
 * Location without tracking: members pick a city, and distance is measured between city
 * centres. That is enough for "how far away" and a distance filter, and it never stores a
 * precise position. In production this becomes a geohash prefix per user (see docs/HLD.md).
 */
export const CITY_COORDS: Record<string, [number, number]> = {
  mumbai: [19.076, 72.8777],
  pune: [18.5204, 73.8567],
  delhi: [28.6139, 77.209],
  "new delhi": [28.6139, 77.209],
  gurugram: [28.4595, 77.0266],
  noida: [28.5355, 77.391],
  bengaluru: [12.9716, 77.5946],
  bangalore: [12.9716, 77.5946],
  chennai: [13.0827, 80.2707],
  hyderabad: [17.385, 78.4867],
  kolkata: [22.5726, 88.3639],
  jaipur: [26.9124, 75.7873],
  ahmedabad: [23.0225, 72.5714],
  goa: [15.2993, 74.124],
  kochi: [9.9312, 76.2673],
  chandigarh: [30.7333, 76.7794],
  lucknow: [26.8467, 80.9462],
  indore: [22.7196, 75.8577],
};

export const coordsOf = (city: string): [number, number] | null => CITY_COORDS[city.trim().toLowerCase()] ?? null;

/** Great circle distance in whole kilometres, or null when either city is unknown. */
export function distanceKm(cityA: string, cityB: string): number | null {
  const a = coordsOf(cityA);
  const b = coordsOf(cityB);
  if (!a || !b) return null;
  const rad = (d: number) => (d * Math.PI) / 180;
  const dLat = rad(b[0] - a[0]);
  const dLon = rad(b[1] - a[1]);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a[0])) * Math.cos(rad(b[0])) * Math.sin(dLon / 2) ** 2;
  return Math.round(2 * 6371 * Math.asin(Math.sqrt(h)));
}

/** 1 in the same city, falling to 0 at 1500 km. Unknown distance counts as neutral. */
export function proximity(km: number | null): number {
  if (km === null) return 0.4;
  return Math.max(0, 1 - km / 1500);
}
