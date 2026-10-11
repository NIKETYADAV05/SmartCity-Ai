"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import {
  GEOAPIFY_ATTRIBUTION,
  MAP_STYLES,
  DEFAULT_CITY_CENTER,
  DEFAULT_ZOOM,
  getGeoapifyTileUrl,
  searchAddress,
  reverseGeocode,
} from "@/lib/geoapify";
import {
  DEMO_REPORTS,
  DEMO_EMERGENCY,
  DEMO_TRAFFIC,
  DEMO_WASTE,
  DEMO_STREETLIGHTS,
  STATUS_CONFIG,
  PRIORITY_CONFIG,
} from "@/lib/demo-data";

// Category emoji icons
const CATEGORY_ICONS = {
  "Road & Infrastructure": "🚧",
  Streetlights: "💡",
  "Waste Management": "🗑️",
  "Water Supply": "💧",
  "Sewage & Drainage": "🚰",
  Emergency: "🚨",
  Other: "📍",
};

export default function InteractiveCityMap({
  initialReports = DEMO_REPORTS,
  showSidebar = true,
  height = "640px",
  userRole = "citizen", // "citizen" | "admin" | "public"
  onReportClick = null,
  initialLayers = null,
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const tileLayerRef = useRef(null);
  const markersLayerRef = useRef(null);
  const userMarkerRef = useRef(null);
  const searchMarkerRef = useRef(null);

  const [mapReady, setMapReady] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState("osm-bright");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [activeLayers, setActiveLayers] = useState(
    initialLayers || {
      reports: true,
      emergency: true,
      traffic: false,
      waste: false,
      streetlights: false,
    }
  );

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  // Active / focused item
  const [activeItem, setActiveItem] = useState(null);
  const [clickedLocation, setClickedLocation] = useState(null);
  const [isLocating, setIsLocating] = useState(false);

  const [allReports, setAllReports] = useState(initialReports);

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const custom = JSON.parse(localStorage.getItem("smartcity_custom_reports") || "[]");
        if (custom.length > 0) {
          const map = new Map();
          custom.forEach((r) => map.set(r.id, r));
          initialReports.forEach((r) => {
            if (!map.has(r.id)) map.set(r.id, r);
          });
          setAllReports(Array.from(map.values()));
        }
      } catch {}
    }, 0);
    return () => clearTimeout(timer);
  }, [initialReports]);

  // Filtered reports
  const filteredReports = allReports.filter((r) => {
    if (selectedCategory !== "All" && r.category !== selectedCategory) return false;
    if (selectedStatus !== "All" && r.status !== selectedStatus) return false;
    return true;
  });

  // Initialize Leaflet Map
  useEffect(() => {
    let isMounted = true;

    async function initMap() {
      if (!mapContainerRef.current || mapInstanceRef.current) return;

      const L = await import("leaflet");

      if (!isMounted) return;

      const map = L.map(mapContainerRef.current, {
        center: [DEFAULT_CITY_CENTER.lat, DEFAULT_CITY_CENTER.lng],
        zoom: DEFAULT_ZOOM,
        zoomControl: false,
      });

      // Add Zoom control at top-right
      L.control.zoom({ position: "topright" }).addTo(map);

      // Add Geoapify tile layer
      const tileLayer = L.tileLayer(getGeoapifyTileUrl(selectedStyle), {
        attribution: GEOAPIFY_ATTRIBUTION,
        maxZoom: 20,
        id: selectedStyle,
      }).addTo(map);

      tileLayerRef.current = tileLayer;

      // Group layer for all data markers
      const markersLayer = L.layerGroup().addTo(map);
      markersLayerRef.current = markersLayer;

      // Click on map handler to inspect / report
      map.on("click", async (e) => {
        const { lat, lng } = e.latlng;
        setClickedLocation({ lat, lng, loading: true });
        setActiveItem(null);

        const rev = await reverseGeocode(lat, lng);
        if (isMounted) {
          setClickedLocation({
            lat,
            lng,
            address: rev?.formatted || `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
            loading: false,
          });
        }
      });

      mapInstanceRef.current = map;
      setMapReady(true);
    }

    initMap();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update Tile Style when changed
  useEffect(() => {
    if (!mapInstanceRef.current || !tileLayerRef.current) return;
    async function updateTile() {
      const L = await import("leaflet");
      if (tileLayerRef.current) {
        mapInstanceRef.current.removeLayer(tileLayerRef.current);
      }
      const newLayer = L.tileLayer(getGeoapifyTileUrl(selectedStyle), {
        attribution: GEOAPIFY_ATTRIBUTION,
        maxZoom: 20,
        id: selectedStyle,
      }).addTo(mapInstanceRef.current);
      tileLayerRef.current = newLayer;
      newLayer.bringToBack();
    }
    updateTile();
  }, [selectedStyle]);

  // Render Markers on Map
  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current || !markersLayerRef.current) return;

    let isMounted = true;

    async function renderMarkers() {
      const L = await import("leaflet");
      if (!isMounted || !markersLayerRef.current) return;

      markersLayerRef.current.clearLayers();

      // 1. Citizen Reports
      if (activeLayers.reports) {
        filteredReports.forEach((r) => {
          if (!r.lat || !r.lng) return;

          const isCritical = r.priority === "Critical" || r.status === "Critical";
          const statusBg =
            r.status === "Resolved"
              ? "bg-emerald-500"
              : r.status === "In Progress"
              ? "bg-blue-600"
              : isCritical
              ? "bg-rose-600"
              : "bg-amber-500";

          const iconEmoji = CATEGORY_ICONS[r.category] || "📍";

          const customIcon = L.divIcon({
            className: "custom-leaflet-div-icon",
            html: `
              <div class="relative group cursor-pointer flex flex-col items-center">
                ${
                  isCritical
                    ? '<span class="absolute -top-1 -right-1 flex h-3 w-3"><span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span><span class="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span></span>'
                    : ""
                }
                <div class="h-8 w-8 rounded-full ${statusBg} text-white flex items-center justify-center shadow-lg border-2 border-white text-xs font-bold transition-transform transform hover:scale-125">
                  <span>${iconEmoji}</span>
                </div>
                <div class="w-1.5 h-1.5 bg-slate-700 rounded-full mt-0.5"></div>
              </div>
            `,
            iconSize: [32, 36],
            iconAnchor: [16, 36],
            popupAnchor: [0, -36],
          });

          const marker = L.marker([r.lat, r.lng], { icon: customIcon });

          const detailHref =
            userRole === "admin"
              ? `/admin/complaints/${r.id}`
              : `/citizen/my-reports/${r.id}`;

          const popupContent = `
            <div class="p-2.5 max-w-xs font-sans text-slate-800">
              <div class="flex items-center justify-between gap-2 mb-1.5">
                <span class="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">${r.id}</span>
                <span class="text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                  r.status === "Resolved"
                    ? "bg-green-100 text-green-700"
                    : r.status === "In Progress"
                    ? "bg-blue-100 text-blue-700"
                    : "bg-amber-100 text-amber-700"
                }">${r.status}</span>
              </div>
              <h4 class="font-bold text-sm text-slate-900 leading-snug">${r.title}</h4>
              <p class="text-xs text-slate-500 mt-1 flex items-center gap-1">
                <span>📍</span> ${r.location}
              </p>
              <div class="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span>🏛️ ${r.department}</span>
                <span class="font-medium text-slate-600">${r.priority}</span>
              </div>
              <div class="mt-3">
                <a href="${detailHref}" class="block text-center rounded-md bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 transition-colors">
                  View Full Details →
                </a>
              </div>
            </div>
          `;

          marker.bindPopup(popupContent, { maxWidth: 280 });
          marker.on("click", () => {
            setActiveItem(r);
            setClickedLocation(null);
            if (onReportClick) onReportClick(r);
          });

          markersLayerRef.current.addLayer(marker);
        });
      }

      // 2. Emergency Layer
      if (activeLayers.emergency) {
        DEMO_EMERGENCY.forEach((em) => {
          if (!em.lat || !em.lng) return;
          const emergencyIcon = L.divIcon({
            className: "emergency-div-icon",
            html: `
              <div class="relative flex flex-col items-center cursor-pointer">
                <span class="animate-ping absolute inline-flex h-8 w-8 rounded-full bg-rose-400 opacity-60"></span>
                <div class="h-8 w-8 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-xl border-2 border-white text-xs font-bold transform hover:scale-125">
                  🚨
                </div>
              </div>
            `,
            iconSize: [32, 32],
            iconAnchor: [16, 16],
          });

          const emMarker = L.marker([em.lat, em.lng], { icon: emergencyIcon });
          emMarker.bindPopup(`
            <div class="p-2.5 max-w-xs font-sans text-slate-800">
              <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 uppercase tracking-wide">Emergency Alert</span>
              <h4 class="font-bold text-sm text-slate-900 mt-1">${em.title}</h4>
              <p class="text-xs text-slate-500 mt-1">Assigned: ${em.assignedTo}</p>
              <p class="text-[11px] text-slate-400 mt-1">Status: ${em.status}</p>
            </div>
          `);
          markersLayerRef.current.addLayer(emMarker);
        });
      }

      // 3. Traffic Hotspots Layer
      if (activeLayers.traffic) {
        DEMO_TRAFFIC.forEach((tr) => {
          if (!tr.lat || !tr.lng) return;
          const trIcon = L.divIcon({
            className: "traffic-div-icon",
            html: `
              <div class="h-7 w-7 rounded-full bg-purple-600 text-white flex items-center justify-center shadow-md border-2 border-white text-xs transform hover:scale-125">
                🚗
              </div>
            `,
            iconSize: [28, 28],
            iconAnchor: [14, 14],
          });
          const trMarker = L.marker([tr.lat, tr.lng], { icon: trIcon });
          trMarker.bindPopup(`
            <div class="p-2 max-w-xs font-sans">
              <span class="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-100 text-purple-700">Traffic Junction</span>
              <h4 class="font-bold text-xs text-slate-800 mt-1">${tr.location}</h4>
              <p class="text-xs text-slate-600 mt-0.5">Status: <strong class="text-purple-700">${tr.status}</strong></p>
              <p class="text-[11px] text-slate-400">Signal: ${tr.signalStatus} • ${tr.cameras} Cameras</p>
            </div>
          `);
          markersLayerRef.current.addLayer(trMarker);
        });
      }

      // 4. Waste Bins Layer
      if (activeLayers.waste) {
        DEMO_WASTE.forEach((w) => {
          if (!w.lat || !w.lng) return;
          const wIcon = L.divIcon({
            className: "waste-div-icon",
            html: `
              <div class="h-7 w-7 rounded-full ${w.fillLevel > 80 ? "bg-red-500" : "bg-teal-600"} text-white flex items-center justify-center shadow-md border-2 border-white text-xs transform hover:scale-125">
                🗑️
              </div>
            `,
            iconSize: [28, 28],
            iconAnchor: [14, 14],
          });
          const wMarker = L.marker([w.lat, w.lng], { icon: wIcon });
          wMarker.bindPopup(`
            <div class="p-2 max-w-xs font-sans">
              <span class="text-[10px] font-bold px-2 py-0.5 rounded ${w.fillLevel > 80 ? "bg-red-100 text-red-700" : "bg-teal-100 text-teal-700"}">Waste Zone</span>
              <h4 class="font-bold text-xs text-slate-800 mt-1">${w.zone}</h4>
              <div class="mt-1 w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div class="h-full ${w.fillLevel > 80 ? "bg-red-500" : "bg-teal-500"}" style="width: ${w.fillLevel}%"></div>
              </div>
              <p class="text-xs text-slate-500 mt-1">Fill Level: <strong>${w.fillLevel}%</strong> (${w.status})</p>
            </div>
          `);
          markersLayerRef.current.addLayer(wMarker);
        });
      }

      // 5. Streetlights Layer
      if (activeLayers.streetlights) {
        DEMO_STREETLIGHTS.forEach((sl) => {
          if (!sl.lat || !sl.lng) return;
          const slIcon = L.divIcon({
            className: "sl-div-icon",
            html: `
              <div class="h-7 w-7 rounded-full ${sl.faulty > 0 ? "bg-amber-500" : "bg-green-600"} text-white flex items-center justify-center shadow-md border-2 border-white text-xs transform hover:scale-125">
                💡
              </div>
            `,
            iconSize: [28, 28],
            iconAnchor: [14, 14],
          });
          const slMarker = L.marker([sl.lat, sl.lng], { icon: slIcon });
          slMarker.bindPopup(`
            <div class="p-2 max-w-xs font-sans">
              <span class="text-[10px] font-bold px-2 py-0.5 rounded bg-yellow-100 text-yellow-800">Streetlight Grid</span>
              <h4 class="font-bold text-xs text-slate-800 mt-1">${sl.zone}</h4>
              <p class="text-xs text-slate-600 mt-1">Operational: ${sl.operational} / ${sl.total}</p>
              <p class="text-xs ${sl.faulty > 0 ? "text-red-600 font-semibold" : "text-green-600"}">Faulty lights: ${sl.faulty}</p>
            </div>
          `);
          markersLayerRef.current.addLayer(slMarker);
        });
      }
    }

    renderMarkers();

    return () => {
      isMounted = false;
    };
  }, [mapReady, filteredReports, activeLayers, userRole, onReportClick]);

  // Focus a specific report on map
  const focusItemOnMap = useCallback(async (item) => {
    if (!mapInstanceRef.current || !item.lat || !item.lng) return;
    mapInstanceRef.current.flyTo([item.lat, item.lng], 16, { duration: 1.2 });
    setActiveItem(item);
  }, []);

  // Geolocation Handler
  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        setIsLocating(false);
        const { latitude, longitude } = pos.coords;
        if (!mapInstanceRef.current) return;

        const L = await import("leaflet");

        mapInstanceRef.current.flyTo([latitude, longitude], 15, { duration: 1.2 });

        if (userMarkerRef.current) {
          mapInstanceRef.current.removeLayer(userMarkerRef.current);
        }

        const userIcon = L.divIcon({
          className: "user-loc-div-icon",
          html: `
            <div class="relative flex items-center justify-center">
              <span class="animate-ping absolute inline-flex h-8 w-8 rounded-full bg-blue-400 opacity-75"></span>
              <div class="h-5 w-5 rounded-full bg-blue-600 border-2 border-white shadow-lg"></div>
            </div>
          `,
          iconSize: [20, 20],
          iconAnchor: [10, 10],
        });

        const marker = L.marker([latitude, longitude], { icon: userIcon }).addTo(
          mapInstanceRef.current
        );
        marker.bindPopup("<strong>You are here</strong>").openPopup();
        userMarkerRef.current = marker;
      },
      (err) => {
        setIsLocating(false);
        console.warn("Location error:", err);
        alert("Could not access your location. Please check browser permissions.");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Reset to default city view
  const handleResetView = () => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.flyTo([DEFAULT_CITY_CENTER.lat, DEFAULT_CITY_CENTER.lng], DEFAULT_ZOOM, {
      duration: 1.0,
    });
    setActiveItem(null);
    setClickedLocation(null);
  };

  const handleSearchInputChange = (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    if (val.trim().length < 2) {
      setSearchResults([]);
      setSearchOpen(false);
    }
  };

  // Address search query with debouncing
  useEffect(() => {
    if (searchQuery.trim().length < 2) return;

    const timer = setTimeout(async () => {
      setIsSearching(true);
      const results = await searchAddress(searchQuery, { limit: 5 });
      setSearchResults(results);
      setIsSearching(false);
      setSearchOpen(true);
    }, 350);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Handle click on search result
  const handleSelectSearchResult = async (result) => {
    setSearchQuery(result.formatted);
    setSearchOpen(false);
    if (!mapInstanceRef.current || !result.lat || !result.lng) return;

    const L = await import("leaflet");

    mapInstanceRef.current.flyTo([result.lat, result.lng], 16, { duration: 1.2 });

    if (searchMarkerRef.current) {
      mapInstanceRef.current.removeLayer(searchMarkerRef.current);
    }

    const sIcon = L.divIcon({
      className: "search-pin-div-icon",
      html: `
        <div class="h-9 w-9 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-xl border-2 border-white text-base transform hover:scale-110">
          📍
        </div>
      `,
      iconSize: [36, 36],
      iconAnchor: [18, 36],
    });

    const marker = L.marker([result.lat, result.lng], { icon: sIcon }).addTo(
      mapInstanceRef.current
    );
    marker
      .bindPopup(
        `<div class="p-2 text-xs font-sans"><strong>${result.formatted}</strong><br/><span class="text-slate-500">${result.lat.toFixed(4)}, ${result.lng.toFixed(4)}</span></div>`
      )
      .openPopup();
    searchMarkerRef.current = marker;
  };

  return (
    <div className="relative rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden flex flex-col">
      {/* ─── Top Control Bar ─── */}
      <div className="border-b border-slate-200 bg-slate-50/80 p-3 flex flex-wrap items-center justify-between gap-3 z-20">
        {/* Left: Geoapify Search Bar */}
        <div className="relative min-w-[260px] max-w-sm flex-1">
          <div className="relative flex items-center">
            <span className="absolute left-3 text-slate-400 pointer-events-none">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchInputChange}
              onFocus={() => searchResults.length > 0 && setSearchOpen(true)}
              placeholder="Search address or area via Geoapify…"
              className="w-full rounded-lg border border-slate-300 bg-white pl-9 pr-8 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {isSearching && (
              <span className="absolute right-2.5 text-slate-400 animate-spin">⟳</span>
            )}
            {searchQuery && !isSearching && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSearchResults([]);
                  setSearchOpen(false);
                }}
                className="absolute right-2 text-slate-400 hover:text-slate-600 text-xs p-1"
              >
                ✕
              </button>
            )}
          </div>

          {/* Autocomplete dropdown */}
          {searchOpen && searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 rounded-lg border border-slate-200 bg-white shadow-xl z-50 divide-y divide-slate-100 max-h-60 overflow-y-auto">
              {searchResults.map((res, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSelectSearchResult(res)}
                  className="w-full px-3 py-2 text-left text-xs hover:bg-blue-50 flex items-start gap-2 text-slate-700 transition-colors"
                >
                  <span className="text-blue-600 mt-0.5">📍</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-800 truncate">{res.addressLine1 || res.formatted}</p>
                    <p className="text-[11px] text-slate-500 truncate">{res.addressLine2 || res.formatted}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Center / Right: Map Style & Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Map style selector */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-500 font-medium hidden sm:inline">Theme:</span>
            <select
              value={selectedStyle}
              onChange={(e) => setSelectedStyle(e.target.value)}
              className="rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
            >
              {MAP_STYLES.map((st) => (
                <option key={st.id} value={st.id}>
                  {st.name}
                </option>
              ))}
            </select>
          </div>

          {/* Locate Me button */}
          <button
            type="button"
            onClick={handleLocateMe}
            disabled={isLocating}
            title="Center on my location"
            className="flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100 transition-colors shadow-sm"
          >
            <span className={isLocating ? "animate-spin" : ""}>🎯</span>
            <span className="hidden sm:inline">Locate Me</span>
          </button>

          {/* Reset View button */}
          <button
            type="button"
            onClick={handleResetView}
            title="Reset city center"
            className="flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100 transition-colors shadow-sm"
          >
            <span>🔄</span>
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>
      </div>

      {/* ─── Layer & Filter Strip ─── */}
      <div className="border-b border-slate-200 bg-white px-3 py-2 flex flex-wrap items-center justify-between gap-2 text-xs">
        {/* Category Filters */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-slate-400 font-medium">Category:</span>
          {["All", "Road & Infrastructure", "Streetlights", "Waste Management", "Water Supply", "Emergency"].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 rounded-full text-[11px] font-medium border transition-colors ${
                selectedCategory === cat
                  ? "border-blue-600 bg-blue-600 text-white shadow-xs"
                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
              }`}
            >
              {cat === "All" ? "All Categories" : cat}
            </button>
          ))}
        </div>

        {/* Toggle Layers */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-slate-400 font-medium">Layers:</span>
          {[
            { key: "reports", label: "Issues", color: "text-blue-600" },
            { key: "emergency", label: "Alerts", color: "text-red-600" },
            { key: "traffic", label: "Traffic", color: "text-purple-600" },
            { key: "waste", label: "Waste Bins", color: "text-teal-600" },
            { key: "streetlights", label: "Streetlights", color: "text-yellow-600" },
          ].map((l) => (
            <label
              key={l.key}
              className={`flex items-center gap-1 cursor-pointer select-none text-[11px] font-medium px-2 py-0.5 rounded border transition-colors ${
                activeLayers[l.key]
                  ? "border-slate-300 bg-slate-100 text-slate-800"
                  : "border-transparent text-slate-400 hover:text-slate-600"
              }`}
            >
              <input
                type="checkbox"
                checked={activeLayers[l.key]}
                onChange={(e) =>
                  setActiveLayers((prev) => ({ ...prev, [l.key]: e.target.checked }))
                }
                className="h-3 w-3 rounded text-blue-600 focus:ring-0"
              />
              <span className={activeLayers[l.key] ? l.color : ""}>{l.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* ─── Map Container + Sidebar Layout ─── */}
      <div className="relative flex-1 flex flex-col lg:flex-row overflow-hidden" style={{ minHeight: height }}>
        {/* Leaflet Map Canvas */}
        <div className="relative flex-1 h-full min-h-[420px] bg-slate-100">
          <div ref={mapContainerRef} className="w-full h-full absolute inset-0 z-0" />

          {/* Attribution pill & Geoapify branding badge */}
          <div className="absolute bottom-2 left-2 z-10 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-md shadow-xs border border-slate-200/80 text-[10px] text-slate-600 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Live Geoapify Maps API</span>
          </div>

          {/* Click-on-Map Quick Action Card */}
          {clickedLocation && (
            <div className="absolute top-4 left-4 z-20 max-w-xs rounded-xl bg-white/95 backdrop-blur-md p-3.5 shadow-xl border border-slate-200 animate-fadeIn">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                    Selected Location
                  </span>
                  <p className="mt-1.5 text-xs font-semibold text-slate-800">
                    {clickedLocation.loading
                      ? "Resolving address via Geoapify…"
                      : clickedLocation.address}
                  </p>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                    {clickedLocation.lat.toFixed(5)}, {clickedLocation.lng.toFixed(5)}
                  </p>
                </div>
                <button
                  onClick={() => setClickedLocation(null)}
                  className="text-slate-400 hover:text-slate-600 text-xs p-1"
                >
                  ✕
                </button>
              </div>

              <div className="mt-3 flex gap-2">
                <Link
                  href={`/citizen/report?lat=${clickedLocation.lat}&lng=${clickedLocation.lng}&loc=${encodeURIComponent(
                    clickedLocation.address || ""
                  )}`}
                  className="flex-1 text-center rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 transition-colors shadow-xs"
                >
                  + Report Issue Here
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* ─── Sidebar: Issue List & Details ─── */}
        {showSidebar && (
          <aside className="w-full lg:w-80 border-t lg:border-t-0 lg:border-l border-slate-200 bg-white flex flex-col max-h-[640px] z-10">
            {/* Header */}
            <div className="p-3 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Issues on Map ({filteredReports.length})
                </h3>
                <p className="text-[10px] text-slate-400">Click any issue to highlight on map</p>
              </div>
              <span className="text-xs font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                {filteredReports.filter((r) => r.status === "Open").length} Open
              </span>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-100 p-1">
              {filteredReports.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400">
                  No issues matching the selected filters.
                </div>
              ) : (
                filteredReports.map((report) => {
                  const isSelected = activeItem?.id === report.id;

                  return (
                    <div
                      key={report.id}
                      onClick={() => focusItemOnMap(report)}
                      className={`p-3 rounded-lg cursor-pointer transition-all ${
                        isSelected
                          ? "bg-blue-50/80 border border-blue-200 shadow-xs"
                          : "hover:bg-slate-50 border border-transparent"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs">{CATEGORY_ICONS[report.category] || "📍"}</span>
                          <span className="text-[10px] font-mono font-semibold text-slate-400">{report.id}</span>
                        </div>
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                            report.status === "Resolved"
                              ? "bg-green-100 text-green-700"
                              : report.status === "In Progress"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {report.status}
                        </span>
                      </div>

                      <h4 className="font-semibold text-xs text-slate-800 mt-1 line-clamp-1">
                        {report.title}
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                        📍 {report.location}
                      </p>

                      <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400">
                        <span>{report.department}</span>
                        <span className={`font-semibold ${report.priority === "Critical" ? "text-red-600" : ""}`}>
                          {report.priority}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer Quick Action */}
            <div className="p-3 border-t border-slate-100 bg-slate-50">
              <Link
                href="/citizen/report"
                className="w-full inline-flex items-center justify-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700 transition-colors shadow-sm"
              >
                <span>➕</span> Report a New Issue
              </Link>
            </div>
          </aside>
        )}
      </div>

      {/* ─── Bottom Status Legend ─── */}
      <div className="border-t border-slate-200 bg-slate-50 px-4 py-2 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-600">
        <div className="flex flex-wrap items-center gap-4">
          <span className="font-medium text-slate-500 text-[11px]">Pin Legend:</span>
          {[
            { color: "bg-rose-600", label: "Critical / Emergency" },
            { color: "bg-amber-500", label: "Open Issue" },
            { color: "bg-blue-600", label: "In Progress" },
            { color: "bg-emerald-500", label: "Resolved" },
            { color: "bg-purple-600", label: "Traffic Spot" },
            { color: "bg-teal-600", label: "Waste Bin" },
          ].map((leg) => (
            <div key={leg.label} className="flex items-center gap-1.5 text-[11px]">
              <span className={`h-2.5 w-2.5 rounded-full ${leg.color}`} />
              <span>{leg.label}</span>
            </div>
          ))}
        </div>
        <div className="text-[11px] text-slate-400">
          Powered by <strong>Geoapify Maps API</strong>
        </div>
      </div>
    </div>
  );
}
