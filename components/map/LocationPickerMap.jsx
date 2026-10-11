"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  GEOAPIFY_ATTRIBUTION,
  DEFAULT_CITY_CENTER,
  getGeoapifyTileUrl,
  searchAddress,
  reverseGeocode,
} from "@/lib/geoapify";

export default function LocationPickerMap({
  initialLat = DEFAULT_CITY_CENTER.lat,
  initialLng = DEFAULT_CITY_CENTER.lng,
  onLocationSelect,
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);

  const [coords, setCoords] = useState({ lat: initialLat, lng: initialLng });
  const [addressPreview, setAddressPreview] = useState("");
  const [isLoadingAddress, setIsLoadingAddress] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  // Update coordinates & reverse geocode
  const handleNewCoordinates = useCallback(
    async (lat, lng) => {
      setCoords({ lat, lng });
      setIsLoadingAddress(true);

      const geoData = await reverseGeocode(lat, lng);
      setIsLoadingAddress(false);

      if (geoData) {
        setAddressPreview(geoData.formatted);
        if (onLocationSelect) {
          onLocationSelect({
            lat,
            lng,
            location: geoData.addressLine1 || geoData.street || geoData.formatted,
            landmark: geoData.suburb || geoData.addressLine2 || "",
            ward: geoData.district ? `Ward: ${geoData.district}` : "",
            formattedAddress: geoData.formatted,
          });
        }
      } else {
        const fallback = `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
        setAddressPreview(fallback);
        if (onLocationSelect) {
          onLocationSelect({ lat, lng, location: fallback });
        }
      }
    },
    [onLocationSelect]
  );

  // Initialize Map
  useEffect(() => {
    let isMounted = true;

    async function init() {
      if (!mapContainerRef.current || mapInstanceRef.current) return;

      const L = await import("leaflet");

      if (!isMounted) return;

      const map = L.map(mapContainerRef.current, {
        center: [initialLat, initialLng],
        zoom: 15,
        zoomControl: false,
      });

      L.control.zoom({ position: "topright" }).addTo(map);

      // Geoapify Tile layer
      L.tileLayer(getGeoapifyTileUrl("osm-bright"), {
        attribution: GEOAPIFY_ATTRIBUTION,
        maxZoom: 20,
      }).addTo(map);

      // Custom draggable picker marker
      const pickerIcon = L.divIcon({
        className: "picker-marker-icon",
        html: `
          <div class="relative flex flex-col items-center cursor-grab active:cursor-grabbing">
            <span class="animate-ping absolute -top-1 inline-flex h-4 w-4 rounded-full bg-blue-400 opacity-75"></span>
            <div class="h-10 w-10 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-2xl border-3 border-white text-base">
              📍
            </div>
            <div class="w-2 h-2 bg-slate-800 rounded-full mt-0.5"></div>
          </div>
        `,
        iconSize: [40, 46],
        iconAnchor: [20, 46],
      });

      const marker = L.marker([initialLat, initialLng], {
        icon: pickerIcon,
        draggable: true,
      }).addTo(map);

      markerRef.current = marker;
      mapInstanceRef.current = map;

      // Handle marker drag
      marker.on("dragend", async (e) => {
        const { lat, lng } = e.target.getLatLng();
        handleNewCoordinates(lat, lng);
      });

      // Handle map click
      map.on("click", async (e) => {
        const { lat, lng } = e.latlng;
        marker.setLatLng([lat, lng]);
        handleNewCoordinates(lat, lng);
      });

      // Initial reverse geocode
      handleNewCoordinates(initialLat, initialLng);
    }

    init();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearchInputChange = (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    if (val.trim().length < 2) {
      setSearchResults([]);
    }
  };

  // Search Address Autocomplete
  useEffect(() => {
    if (searchQuery.trim().length < 2) return;

    const t = setTimeout(async () => {
      setIsSearching(true);
      const res = await searchAddress(searchQuery, { limit: 4 });
      setSearchResults(res);
      setIsSearching(false);
    }, 350);

    return () => clearTimeout(t);
  }, [searchQuery]);

  const handleSelectSearch = (res) => {
    setSearchQuery(res.formatted);
    setSearchResults([]);
    if (!mapInstanceRef.current || !markerRef.current) return;

    mapInstanceRef.current.flyTo([res.lat, res.lng], 16);
    markerRef.current.setLatLng([res.lat, res.lng]);
    handleNewCoordinates(res.lat, res.lng);
  };

  // GPS Locate me
  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        const { latitude, longitude } = pos.coords;
        if (!mapInstanceRef.current || !markerRef.current) return;

        mapInstanceRef.current.flyTo([latitude, longitude], 16);
        markerRef.current.setLatLng([latitude, longitude]);
        handleNewCoordinates(latitude, longitude);
      },
      (err) => {
        setIsLocating(false);
        console.warn("Geolocation error:", err);
        alert("Could not access your location. Please check browser permissions.");
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  return (
    <div className="space-y-3">
      {/* Search & GPS bar */}
      <div className="flex gap-2 relative">
        <div className="relative flex-1">
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchInputChange}
            placeholder="Search address or landmark via Geoapify…"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {isSearching && (
            <span className="absolute right-3 top-2.5 text-xs text-slate-400 animate-spin">
              ⟳
            </span>
          )}

          {searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 rounded-lg border border-slate-200 bg-white shadow-lg z-50 divide-y divide-slate-100 max-h-48 overflow-y-auto">
              {searchResults.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectSearch(item)}
                  className="w-full px-3 py-2 text-left text-xs hover:bg-blue-50 flex items-start gap-2 text-slate-700 transition-colors"
                >
                  <span className="text-blue-500">📍</span>
                  <div className="truncate">
                    <p className="font-medium truncate">{item.addressLine1 || item.formatted}</p>
                    <p className="text-[10px] text-slate-400 truncate">{item.addressLine2 || item.city}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={handleLocateMe}
          disabled={isLocating}
          className="shrink-0 flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
        >
          <span>🎯</span>
          <span>{isLocating ? "Locating…" : "My GPS"}</span>
        </button>
      </div>

      {/* Map view */}
      <div className="relative h-64 rounded-xl border border-slate-300 overflow-hidden shadow-inner bg-slate-100">
        <div ref={mapContainerRef} className="w-full h-full" />
        <div className="absolute top-2 left-2 z-10 bg-white/90 backdrop-blur-xs px-2 py-1 rounded text-[10px] text-slate-600 shadow-xs border border-slate-200">
          💡 Click or drag pin to adjust exact spot
        </div>
      </div>

      {/* Resolved address banner */}
      <div className="rounded-lg bg-blue-50/80 border border-blue-100 p-2.5 flex items-center gap-2 text-xs">
        <span className="text-base">📌</span>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-blue-900 truncate">
            {isLoadingAddress ? "Resolving address via Geoapify API…" : addressPreview || "Selected Location"}
          </p>
          <p className="text-[10px] text-blue-600 font-mono">
            Latitude: {coords.lat.toFixed(5)}, Longitude: {coords.lng.toFixed(5)}
          </p>
        </div>
      </div>
    </div>
  );
}
