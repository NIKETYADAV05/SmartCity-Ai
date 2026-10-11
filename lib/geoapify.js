/**
 * geoapify.js
 * Helpers for Geoapify Map Tiles, Geocoding, Reverse Geocoding, and Static Maps.
 */

export const GEOAPIFY_API_KEY =
  process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY || "998c140029394646b67fcf16ab8987d7";

export const DEFAULT_CITY_CENTER = {
  lat: 12.9716,
  lng: 77.5946,
  name: "City Centre",
};

export const DEFAULT_ZOOM = 13;

export const MAP_STYLES = [
  { id: "osm-bright", name: "Standard Bright", description: "Default colorful street map" },
  { id: "positron", name: "Positron Light", description: "Clean high-contrast minimal style" },
  { id: "dark-matter", name: "Dark Matter", description: "Modern dark mode map" },
  { id: "klokantech-basic", name: "Minimalist", description: "Simple roads and topography" },
  { id: "osm-carto", name: "OpenStreetMap Carto", description: "Classic community cartography" },
];

export const GEOAPIFY_ATTRIBUTION =
  'Powered by <a href="https://www.geoapify.com/" target="_blank" rel="noopener noreferrer">Geoapify</a> | <a href="https://openmaptiles.org/" target="_blank" rel="noopener noreferrer">© OpenMapTiles</a> <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">© OpenStreetMap</a> contributors';

/**
 * Returns the Geoapify Tile Layer URL pattern for Leaflet
 */
export function getGeoapifyTileUrl(style = "osm-bright", retina = true) {
  const retinaSuffix = retina ? "@2x" : "";
  return `https://maps.geoapify.com/v1/tile/${style}/{z}/{x}/{y}${retinaSuffix}.png?apiKey=${GEOAPIFY_API_KEY}`;
}

/**
 * Generate a Static Map URL using Geoapify Static Map API
 */
export function getGeoapifyStaticMapUrl({
  lat,
  lng,
  zoom = 14,
  width = 600,
  height = 320,
  style = "osm-bright",
  markerColor = "%232563eb",
}) {
  if (!lat || !lng) return "";
  const marker = `lonlat:${lng},${lat};color:${markerColor};size:medium`;
  return `https://maps.geoapify.com/v1/staticmap?style=${style}&width=${width}&height=${height}&center=lonlat:${lng},${lat}&zoom=${zoom}&marker=${marker}&apiKey=${GEOAPIFY_API_KEY}`;
}

/**
 * Address autocomplete search using Geoapify Geocoding API
 */
export async function searchAddress(query, { limit = 5 } = {}) {
  if (!query || query.trim().length < 2) return [];
  try {
    const url = `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(
      query.trim()
    )}&limit=${limit}&apiKey=${GEOAPIFY_API_KEY}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Geocoding failed (${res.status})`);
    const data = await res.json();
    return (data.features || []).map((f) => ({
      formatted: f.properties.formatted,
      addressLine1: f.properties.address_line1,
      addressLine2: f.properties.address_line2,
      lat: f.properties.lat,
      lng: f.properties.lon,
      city: f.properties.city || f.properties.county || "",
      district: f.properties.suburb || f.properties.district || "",
      postcode: f.properties.postcode || "",
      raw: f.properties,
    }));
  } catch (err) {
    console.error("Geoapify search error:", err);
    return [];
  }
}

/**
 * Reverse geocode latitude and longitude to a human-readable address
 */
export async function reverseGeocode(lat, lng) {
  if (!lat || !lng) return null;
  try {
    const url = `https://api.geoapify.com/v1/geocode/reverse?lat=${lat}&lon=${lng}&apiKey=${GEOAPIFY_API_KEY}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Reverse geocode failed (${res.status})`);
    const data = await res.json();
    const feat = data.features?.[0];
    if (!feat) return null;
    return {
      formatted: feat.properties.formatted,
      addressLine1: feat.properties.address_line1,
      addressLine2: feat.properties.address_line2,
      street: feat.properties.street || "",
      suburb: feat.properties.suburb || feat.properties.district || "",
      city: feat.properties.city || "",
      postcode: feat.properties.postcode || "",
      country: feat.properties.country || "",
      lat: feat.properties.lat,
      lng: feat.properties.lon,
    };
  } catch (err) {
    console.error("Geoapify reverse geocoding error:", err);
    return null;
  }
}
