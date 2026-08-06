import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix Leaflet marker icons
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

interface LeafletMapProps {
  wilayas: any[];
  zones: any;
  shipping: any[];
  lang: string;
  t: (key: any) => string;
}

export default function LeafletMap({ wilayas, zones, shipping, lang, t }: LeafletMapProps) {
  const getZoneColor = (code: number) => {
    if (!zones) return "#94a3b8";
    if (zones.North.includes(code)) return "#3b82f6";
    if (zones.Highlands.includes(code)) return "#10b981";
    if (zones.South.includes(code)) return "#f59e0b";
    return "#94a3b8";
  };

  return (
    <div className="h-full w-full relative group min-h-[500px]">
      <MapContainer
        center={[30.0, 3.0]}
        zoom={5}
        className="h-full w-full grayscale contrast-125 transition-all duration-700 z-0"
        scrollWheelZoom={true}
        aria-label="Interactive Algerian Territory Map"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          className="map-tiles-dark-transition"
        />


      
      {wilayas.map((w) => {
        const rate = shipping.find(r => r.wilaya_code === w.code);
        return (
          <Marker 
            key={w.code} 
            position={[w.lat, w.lng]}
            icon={L.divIcon({
              className: "custom-div-icon",
              html: `<div style="background-color: ${getZoneColor(w.code)}; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 1px 3px rgba(0,0,0,0.3);"></div>`,
              iconSize: [12, 12],
              iconAnchor: [6, 6]
            })}
          >
            <Popup>
              <div className="p-1 font-sans">
                <h3 className="mb-1 text-base font-bold text-black">{w.code}. {lang === "ar" ? w.arabic : w.ascii}</h3>
                {rate && (
                  <div className="space-y-1 text-xs text-gray-600">
                    <p className="font-semibold uppercase text-gray-400 tracking-wider">{t("api.catLogistics")}</p>
                    <div className="flex justify-between gap-4">
                      <span>Home Delivery:</span>
                      <span className="font-bold text-black">{rate.delivery_home.min}-{rate.delivery_home.max} {rate.currency}</span>
                    </div>
                    <div className="flex justify-between gap-4">
                      <span>Office Delivery:</span>
                      <span className="font-bold text-black">{rate.delivery_office.min}-{rate.delivery_office.max} {rate.currency}</span>
                    </div>
                    <div className="flex justify-between gap-4">
                      <span>Zone:</span>
                      <span className="capitalize font-bold text-black">{rate.zone}</span>
                    </div>
                  </div>
                )}
              </div>
            </Popup>
          </Marker>
        )})}
      </MapContainer>

      {/* Mobile focused detail sheet / QA Overlay */}
      <div className="absolute bottom-6 left-6 right-6 z-[1000] lg:hidden">
        <div className="bg-white/95 backdrop-blur-md rounded-2xl p-4 shadow-2xl border border-gray-200 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Territory QA Mode</span>
            <button className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></button>
          </div>
          <div className="flex items-center gap-3 overflow-x-auto pb-1 no-scrollbar">
            <button className="shrink-0 px-3 py-1 rounded bg-black text-white text-[10px] font-bold">Refresh Tiles</button>
            <button className="shrink-0 px-3 py-1 rounded border border-gray-200 text-black text-[10px] font-bold">Re-center</button>
            <button className="shrink-0 px-3 py-1 rounded border border-gray-200 text-black text-[10px] font-bold">Check ZIPs</button>
          </div>
        </div>
      </div>
      
      {/* Keyboard Controls Overlay (Visible on focus) */}
      <div className="absolute top-4 right-4 z-[1000] pointer-events-none opacity-0 focus-within:opacity-100 transition-opacity">
        <div className="bg-black text-white text-[10px] font-bold p-2 rounded shadow-lg uppercase tracking-widest">
          Use Arrow Keys to Pan | +/- to Zoom
        </div>
      </div>
    </div>
  );
}
