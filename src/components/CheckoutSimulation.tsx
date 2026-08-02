import { useEffect, useRef, useState } from "react";

const FIELDS = [
  { label: "الولاية", placeholder: "اختر الولاية", value: "16 - الجزائر (Algiers)" },
  { label: "الدائرة", placeholder: "اختر الدائرة", value: "سيدي امحمد" },
  { label: "البلدية", placeholder: "اختر البلدية", value: "الجزائر الوسطى" },
];

const STEP_DELAY = 800;

export interface LiveAddress {
  wilayaCode: string;
  wilayaName: string;
  dairaName: string;
  communeName: string;
}

export function CheckoutSimulation({ live }: { live?: LiveAddress }) {
  const [step, setStep] = useState(0);
  const [running, setRunning] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const liveValues = [
    live?.wilayaCode ? `${live.wilayaCode} - ${live.wilayaName}` : "",
    live?.dairaName ?? "",
    live?.communeName ?? "",
  ];
  const hasLive = liveValues.some(Boolean);
  const livePostal = live?.wilayaCode
    ? `${String(live.wilayaCode).padStart(2, "0")}000`
    : "";

  useEffect(() => {
    return () => {
      timers.current.forEach(clearTimeout);
    };
  }, []);

  const play = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setStep(0);
    setRunning(true);
    for (let i = 1; i <= 4; i += 1) {
      timers.current.push(
        setTimeout(() => {
          setStep(i);
          if (i === 4) setRunning(false);
        }, STEP_DELAY * i),
      );
    }
  };

  const reset = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setRunning(false);
    setStep(0);
  };

  const stateFor = (index: number) => {
    const fieldStep = index + 1;
    if (step === fieldStep) return "active";
    if (step > fieldStep) return "done";
    if (step >= index) return "ready";
    return "locked";
  };

  return (
    <div className="relative mx-auto mt-12 max-w-3xl overflow-hidden rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-gray-200 pb-5">
        <div>
          <h3 className="text-base font-semibold text-black">Checkout</h3>
          <p className="mt-1 text-sm text-gray-500">Order Total: 4,500 DZD</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={play}
            disabled={running}
            className="flex items-center gap-2 rounded-md bg-black px-4 py-2 text-xs text-white transition hover:bg-gray-800 disabled:bg-gray-300 disabled:text-gray-500"
          >
            ▶ Watch Auto-Demo
          </button>
          {step === 4 && !running && (
            <button
              type="button"
              onClick={reset}
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-xs text-gray-700 transition hover:bg-gray-50"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      <div className="mt-6" dir="rtl">
        <label className="mb-2 block text-sm font-medium text-gray-700" htmlFor="sim-name">
          الاسم الكامل
        </label>
        <input
          id="sim-name"
          type="text"
          value="Ahmed Benali"
          readOnly
          tabIndex={-1}
          className="mb-4 w-full rounded-lg border border-gray-200 bg-gray-50 p-3 text-gray-500"
        />
        <label className="mb-2 block text-sm font-medium text-gray-700" htmlFor="sim-phone">
          رقم الهاتف
        </label>
        <input
          id="sim-phone"
          type="text"
          value="0550 12 34 56"
          readOnly
          dir="ltr"
          tabIndex={-1}
          className="mb-4 w-full rounded-lg border border-gray-200 bg-gray-50 p-3 text-right text-gray-500"
        />

        {FIELDS.map((f, i) => {
          const state = stateFor(i);
          const shown = state === "active" || state === "done";
          const base =
            "w-full p-3 border rounded-lg mb-4 text-right font-medium transition-all duration-500 ease-out";
          const tone =
            state === "active"
              ? "border-black ring-1 ring-black bg-white text-black"
              : state === "done"
                ? "border-gray-200 bg-white text-black"
                : state === "ready"
                  ? "border-gray-300 bg-white text-gray-400"
                  : "border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed";
          return (
            <div key={f.label}>
              <span className="mb-2 block text-sm font-medium text-gray-700">{f.label}</span>
              <div className={`${base} ${tone}`} aria-live="polite">
                <span className="transition-opacity duration-500">
                  {shown ? f.value : f.placeholder}
                </span>
              </div>
            </div>
          );
        })}

        <span className="mb-2 block text-sm font-medium text-gray-700">الرمز البريدي</span>
        <div
          className={`w-full rounded-lg border p-3 text-right font-medium transition-all duration-500 ease-out ${
            step >= 4
              ? "border-gray-200 bg-white text-black opacity-100"
              : "border-gray-200 bg-gray-50 text-gray-400 opacity-70"
          }`}
        >
          {step >= 4 ? "16000" : "00000"}
        </div>
        <div
          className={`mt-3 flex items-center justify-end gap-2 text-sm text-gray-600 transition-all duration-500 ease-out ${
            step >= 4 ? "translate-y-0 opacity-100" : "translate-y-1 opacity-0"
          }`}
        >
          <span>Address validated</span>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-gray-800"
            aria-hidden="true"
          >
            <path d="m20 6-11 11-5-5" />
          </svg>
        </div>
      </div>

      {step === 0 && !running && (
        <button
          type="button"
          onClick={play}
          className="absolute inset-x-0 bottom-0 top-28 flex items-start justify-center bg-white/60 pt-16 text-sm font-medium text-black backdrop-blur-[1px] transition hover:bg-white/70"
        >
          <span className="rounded-md border border-gray-300 bg-white px-5 py-2.5 shadow-sm">
            ▶ Play Animation
          </span>
        </button>
      )}
    </div>
  );
}

export default CheckoutSimulation;
