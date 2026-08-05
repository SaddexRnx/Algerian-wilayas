import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { 
  MapContainer, 
  TileLayer, 
  Marker, 
  Popup, 
  GeoJSON, 
  useMap 
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix Leaflet marker icons in React
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

export const Route = createFileRoute("/map")({
  head: () => ({
    meta: [
      { title: "Interactive Algerian Map | DZ Address Picker" },
      { name: "description", content: "Explore Algerian wilayas, zones, and shipping rates on an interactive map." },
    ],
  }),
  component: MapPage,
});

function MapPage() {
  const { t, dir } = useI18n();
  const [wilayas, setWilayas] = useState<any[]>([]);
  const [zones, setZones] = useState<any>(null);
  const [shipping, setShipping] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [wRes, zRes, sRes] = await Promise.all([
          fetch("/api/coordinates/wilayas.json"),
          fetch("/api/shipping/zones.json"),
          fetch("/api/shipping/rates.json"),
        ]);
        
        const wData = await wRes.json();
        const zData = await zRes.json();
        const sData = await sRes.json();
        
        setWilayas(wData);
        setZones(zData);
        setShipping(sData);
      } catch (error) {
        console.error("Error fetching map data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getZoneColor = (code: number) => {
    if (!zones) return "#94a3b8";
    if (zones.North.includes(code)) return "#3b82f6"; // Blue
    if (zones.Highlands.includes(code)) return "#10b981"; // Green
    if (zones.South.includes(code)) return "#f59e0b"; // Orange
    return "#94a3b8";
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-white font-sans">
        <div className="animate-pulse text-lg font-bold text-black">Loading Algerian Maps...</div>
      </div>
    );
  }

  return (
    <div dir={dir} className="flex h-screen flex-col bg-white font-sans antialiased">
      <header className="border-b border-gray-200 bg-white p-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <h1 className="text-xl font-bold text-black">DZ Address Map - v2.0 Beta</h1>
          <a href="/" className="text-sm font-medium text-gray-600 hover:text-black">← Back Home</a>
        </div>
      </header>

      <div className="flex-1">
        <MapContainer
          center={[32.0, 3.0]}
          zoom={5}
          className="h-full w-full"
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
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
                    <h3 className="mb-1 text-base font-bold text-black">{w.code}. {w.name}</h3>
                    {rate && (
                      <div className="space-y-1 text-xs text-gray-600">
                        <p className="font-semibold uppercase text-gray-400 tracking-wider">Logistics</p>
                        <div className="flex justify-between">
                          <span>Home Delivery:</span>
                          <span className="font-bold text-black">{rate.delivery_home.min}-{rate.delivery_home.max} {rate.currency}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Office Delivery:</span>
                          <span className="font-bold text-black">{rate.delivery_office.min}-{rate.delivery_office.max} {rate.currency}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Zone:</span>
                          <span className="capitalize font-bold text-black">{rate.zone}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>

      <footer className="border-t border-gray-200 bg-gray-50 p-4">
        <div className="mx-auto max-w-7xl flex flex-wrap gap-6 text-xs font-medium text-gray-500 uppercase tracking-widest">
           <div className="flex items-center gap-2">
             <span className="h-3 w-3 rounded-full bg-blue-500"></span> Zone 1: North
           </div>
           <div className="flex items-center gap-2">
             <span className="h-3 w-3 rounded-full bg-emerald-500"></span> Zone 2: Highlands
           </div>
           <div className="flex items-center gap-2">
             <span className="h-3 w-3 rounded-full bg-amber-500"></span> Zone 3: South
           </div>
        </div>
      </footer>
    </div>
  );
}
