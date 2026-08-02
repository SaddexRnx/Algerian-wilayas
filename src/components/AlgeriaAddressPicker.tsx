import { useEffect, useMemo, useState } from "react";

export interface Commune {
  arabic: string;
  ascii: string;
  postal_code?: string | undefined;
}

export interface Daira {
  arabic: string;
  ascii: string;
  communes: Commune[];
}

export interface Wilaya {
  code: number;
  arabic: string;
  ascii: string;
  dairas: Daira[];
}

const DATA_URL =
  "https://raw.githubusercontent.com/islam-re/Algeria-wilayas/main/json/wilaya-daira-commune/wilaya-daira-commune.json";

const selectClass =
  "w-full p-3 border border-gray-300 rounded-lg bg-white text-black focus:ring-1 focus:ring-black focus:border-black outline-none transition disabled:bg-gray-50 disabled:text-gray-400";

function Skeleton() {
  return (
    <div className="space-y-5">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="space-y-2">
          <div className="h-3 w-24 rounded bg-gray-100" />
          <div className="h-12 w-full rounded-lg bg-gray-100" />
        </div>
      ))}
    </div>
  );
}

export function AlgeriaAddressPicker() {
  const [data, setData] = useState<Wilaya[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  const [wilayaCode, setWilayaCode] = useState("");
  const [dairaIndex, setDairaIndex] = useState("");
  const [communeIndex, setCommuneIndex] = useState("");

  useEffect(() => {
    let active = true;
    setIsLoading(true);
    setIsError(false);
    fetch(DATA_URL)
      .then((r) => {
        if (!r.ok) throw new Error("Request failed");
        return r.json();
      })
      .then((json: unknown) => {
        if (!active) return;
        const list: Wilaya[] = (Array.isArray(json) ? json : []).map((w) => {
          const raw = w as Record<string, unknown>;
          return {
            code: Number(raw["code"]),
            arabic: String(raw["arabic"] ?? ""),
            ascii: String(raw["ascii"] ?? ""),
            dairas: (Array.isArray(raw["dairas"]) ? raw["dairas"] : []).map((d: unknown) => {
              const rd = d as Record<string, unknown>;
              return {
                arabic: String(rd["arabic"] ?? ""),
                ascii: String(rd["ascii"] ?? ""),
                communes: (Array.isArray(rd["communes"]) ? rd["communes"] : []).map(
                  (c: unknown) => {
                    const rc = c as Record<string, unknown>;
                    return {
                      arabic: String(rc["arabic"] ?? ""),
                      ascii: String(rc["ascii"] ?? ""),
                      postal_code: rc["postal_code"] ? String(rc["postal_code"]) : undefined,
                    };
                  },
                ),
              };
            }),
          };
        });
        setData(list);
        setIsLoading(false);
      })
      .catch(() => {
        if (!active) return;
        setIsError(true);
        setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const wilaya = useMemo(
    () => data.find((w) => String(w.code) === wilayaCode),
    [data, wilayaCode],
  );
  const daira = wilaya?.dairas[Number(dairaIndex)];
  const commune = daira?.communes[Number(communeIndex)];

  const postalCode = commune
    ? (commune.postal_code ?? `${String(wilaya?.code ?? 0).padStart(2, "0")}000`)
    : "";
  const isGenerated = Boolean(commune && !commune.postal_code);

  if (isLoading) return <Skeleton />;

  if (isError) {
    return (
      <p className="text-sm text-gray-500">
        Data could not be loaded right now. Please refresh the page to try again.
      </p>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <label htmlFor="dz-wilaya" className="mb-2 block text-sm font-medium text-gray-700">
          Wilaya
        </label>
        <select
          id="dz-wilaya"
          className={selectClass}
          value={wilayaCode}
          onChange={(e) => {
            setWilayaCode(e.target.value);
            setDairaIndex("");
            setCommuneIndex("");
          }}
        >
          <option value="">Select a wilaya</option>
          {data.map((w) => (
            <option key={w.code} value={String(w.code)}>
              {w.code} - {w.arabic} ({w.ascii})
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="dz-daira" className="mb-2 block text-sm font-medium text-gray-700">
          Daira
        </label>
        <select
          id="dz-daira"
          className={selectClass}
          disabled={!wilaya}
          value={dairaIndex}
          onChange={(e) => {
            setDairaIndex(e.target.value);
            setCommuneIndex("");
          }}
        >
          <option value="">Select a daira</option>
          {wilaya?.dairas.map((d, i) => (
            <option key={`${d.ascii}-${i}`} value={String(i)}>
              {d.arabic}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="dz-commune" className="mb-2 block text-sm font-medium text-gray-700">
          Commune
        </label>
        <select
          id="dz-commune"
          className={selectClass}
          disabled={!daira}
          value={communeIndex}
          onChange={(e) => setCommuneIndex(e.target.value)}
        >
          <option value="">Select a commune</option>
          {daira?.communes.map((c, i) => (
            <option key={`${c.ascii}-${i}`} value={String(i)}>
              {c.arabic}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="dz-postal" className="mb-2 block text-sm font-medium text-gray-700">
          Postal Code
        </label>
        <input
          id="dz-postal"
          readOnly
          value={postalCode}
          placeholder="—"
          className={`${selectClass} bg-gray-50`}
        />
        {isGenerated && (
          <p className="mt-2 text-xs text-gray-400">Auto-generated placeholder</p>
        )}
      </div>
    </div>
  );
}

export default AlgeriaAddressPicker;
