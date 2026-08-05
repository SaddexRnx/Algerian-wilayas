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
        );
      })}
    </MapContainer>
  );
}
