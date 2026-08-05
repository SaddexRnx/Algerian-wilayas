import { useEffect, useRef, useState } from "react";
import { useI18n, type TranslationKey } from "@/lib/i18n";

const FIELDS: { labelKey: TranslationKey; placeholderKey: TranslationKey; value: string }[] = [
  { labelKey: "picker.wilaya", placeholderKey: "picker.selectWilaya", value: "16 - الجزائر" },
  { labelKey: "picker.daira", placeholderKey: "picker.selectDaira", value: "سيدي امحمد" },
  { labelKey: "picker.commune", placeholderKey: "picker.selectCommune", value: "الجزائر الوسطى" },
];

const STEP_DELAY = 800;

export interface LiveAddress {
  wilayaCode: string;
  wilayaName: string;
  dairaName: string;
  communeName: string;
}

export function CheckoutSimulation({ live }: { live?: LiveAddress | undefined }) {
  const { t } = useI18n();
  const [step, setStep] = useState(0);
  const [running, setRunning] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const liveValues = [
    live?.wilayaCode ? `${live.wilayaCode} - ${live.wilayaName}` : "",
    live?.dairaName ?? "",
    live?.communeName ?? "",
  ];
  const hasLive = liveValues.some(Boolean);

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
    if (hasLive) {
      if (liveValues[index]) return "done";
      if (index === 0 || liveValues[index - 1]) return "ready";
      return "locked";
    }
    const fieldStep = index + 1;
    if (step === fieldStep) return "active";
    if (step > fieldStep) return "done";
    if (step >= index) return "ready";
    return "locked";
  };

  const liveComplete = hasLive && liveValues.every(Boolean);
  const validated = hasLive ? liveComplete : step >= 4;

  return (
    <div className="relative mx-auto mt-10 max-w-3xl overflow-hidden rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:mt-12 sm:p-8 sm:mx-0">
      <div className="flex flex-col sm:flex-row sm:items-start gap-4 border-b border-gray-200 pb-5 sm:justify-between">
        <div className="min-w-0">
          <h3 className="truncate text-base font-semibold text-black">{t("checkout.header")}</h3>
          <p className="mt-1 text-sm text-gray-500">{t("checkout.total")}</p>
          {hasLive && (
            <p className="mt-2 inline-block rounded border border-gray-200 bg-gray-50 px-2 py-0.5 text-xs text-gray-600">
              {t("checkout.synced")}
            </p>
          )}
        </div>
        <div className="flex shrink-0 flex-col items-stretch gap-2 sm:flex-row sm:items-center">
          <button
            type="button"
            onClick={play}
            disabled={running || hasLive}
            className="flex items-center justify-center gap-2 rounded-md bg-black px-4 py-2 text-xs text-white transition hover:bg-gray-800 disabled:bg-gray-300 disabled:text-gray-500"
          >
            {t("checkout.auto")}
          </button>
          {step === 4 && !running && (
            <button
              type="button"
              onClick={reset}
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-xs text-gray-700 transition hover:bg-gray-50"
            >
              {t("checkout.reset")}
            </button>
          )}
        </div>
      </div>

      <div className="mt-6" dir="rtl">
        <label className="mb-2 block text-sm font-medium text-gray-700" htmlFor="sim-name">
          {t("checkout.name")}
        </label>
        <input
          id="sim-name"
          type="text"
          value="Ahmed Ahmed"
          readOnly
          tabIndex={-1}
          className="mb-4 w-full rounded-lg border border-gray-200 bg-gray-50 p-3 text-gray-500"
        />
        <label className="mb-2 block text-sm font-medium text-gray-700" htmlFor="sim-phone">
          {t("checkout.phone")}
        </label>
        <input
          id="sim-phone"
          type="text"
          value="0000 00 00 00"
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
            <div key={f.labelKey}>
              <span className="mb-2 block text-sm font-medium text-gray-700">
                {t(f.labelKey)}
              </span>
              <div className={`${base} ${tone}`} aria-live="polite">
                <span className="truncate transition-opacity duration-500">
                  {shown ? liveValues[i] || f.value : t(f.placeholderKey)}
                </span>
              </div>
            </div>
          );
        })}

        <div
          className={`mt-3 flex items-center justify-end gap-2 text-sm text-gray-600 transition-all duration-500 ease-out ${
            validated ? "translate-y-0 opacity-100" : "translate-y-1 opacity-0"
          }`}
        >
          <span>{t("checkout.validated")}</span>
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

      {step === 0 && !running && !hasLive && (
        <button
          type="button"
          onClick={play}
          className="absolute inset-x-0 top-32 bottom-0 flex items-start justify-center bg-white/60 pt-16 text-sm font-medium text-black backdrop-blur-[1px] transition hover:bg-white/70"
        >
          <span className="rounded-md border border-gray-300 bg-white px-5 py-2.5 shadow-sm">
            {t("checkout.play")}
          </span>
        </button>
      )}
    </div>
  );
}

export default CheckoutSimulation;
