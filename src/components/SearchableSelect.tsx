import { useEffect, useId, useMemo, useRef, useState } from "react";

export interface SelectOption {
  value: string;
  label: string;
  search?: string;
}

const MAX_RENDERED = 50;

export function SearchableSelect({
  id,
  label,
  value,
  options,
  onChange,
  disabled = false,
  placeholder = "Select an option",
  searchPlaceholder = "Search…",
  emptyLabel = "No matches",
}: {
  id?: string;
  label: string;
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyLabel?: string;
}) {

  const reactId = useId();
  const baseId = id ?? reactId;
  const listId = `${baseId}-listbox`;

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [highlight, setHighlight] = useState(0);

  const rootRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const selected = options.find((o) => o.value === value);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = q
      ? options.filter((o) => (o.search ?? o.label).toLowerCase().includes(q))
      : options;
    return list.slice(0, MAX_RENDERED);
  }, [options, query]);

  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open]);

  useEffect(() => {
    if (open) {
      setQuery("");
      setHighlight(Math.max(0, filtered.findIndex((o) => o.value === value)));
      window.setTimeout(() => searchRef.current?.focus(), 0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const el = listRef.current?.children[highlight] as HTMLElement | undefined;
    el?.scrollIntoView({ block: "nearest" });
  }, [highlight, open]);

  const commit = (v: string) => {
    onChange(v);
    setOpen(false);
    setQuery("");
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;
    if (!open && (e.key === "Enter" || e.key === " " || e.key === "ArrowDown")) {
      e.preventDefault();
      setOpen(true);
      return;
    }
    if (!open) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlight((h) => Math.min(h + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h) => Math.max(h - 1, 0));
    } else if (e.key === "Home") {
      e.preventDefault();
      setHighlight(0);
    } else if (e.key === "End") {
      e.preventDefault();
      setHighlight(Math.max(0, filtered.length - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const opt = filtered[highlight];
      if (opt) commit(opt.value);
    } else if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
    } else if (e.key === "Tab") {
      setOpen(false);
    }
  };

  return (
    <div className="relative" ref={rootRef} onKeyDown={onKeyDown}>
      <label htmlFor={baseId} className="mb-2 block text-sm font-medium text-gray-700">
        {label}
      </label>
      <button
        id={baseId}
        type="button"
        role="combobox"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-controls={open ? listId : undefined}
        aria-disabled={disabled}
        disabled={disabled}
        onClick={() => !disabled && setOpen((o) => !o)}
        className={`flex w-full items-center justify-between gap-3 rounded-lg border p-3 text-left transition outline-none focus-visible:ring-1 focus-visible:ring-black ${
          disabled
            ? "cursor-not-allowed border-gray-200 bg-gray-50 text-gray-400"
            : "border-gray-300 bg-white text-black hover:border-gray-400 focus-visible:border-black"
        }`}
      >
        <span className={`truncate ${selected ? "" : "text-gray-400"}`} dir="auto">
          {selected ? selected.label : placeholder}
        </span>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          className={`shrink-0 text-gray-500 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {open && !disabled && (
        <div className="absolute z-10 mt-1 max-h-60 w-full overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg">
          <div className="sticky top-0 border-b border-gray-100 bg-white p-2">
            <input
              ref={searchRef}
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setHighlight(0);
              }}
              placeholder={searchPlaceholder}
              aria-label={`Search ${label.toLowerCase()}`}
              aria-autocomplete="list"
              aria-controls={listId}
              className="w-full rounded-md border border-gray-200 bg-white p-2 text-sm text-black outline-none placeholder:text-gray-400 focus:border-black focus:ring-1 focus:ring-black"
            />
          </div>
          <ul id={listId} role="listbox" aria-label={label} ref={listRef} className="py-1">
            {filtered.length === 0 && (
              <li className="px-3 py-2 text-sm text-gray-400">{emptyLabel}</li>
            )}

            {filtered.map((o, i) => {
              const isSelected = o.value === value;
              return (
                <li
                  key={o.value}
                  role="option"
                  aria-selected={isSelected}
                  onMouseEnter={() => setHighlight(i)}
                  onClick={() => commit(o.value)}
                  dir="auto"
                  className={`cursor-pointer px-3 py-2 text-sm transition-colors ${
                    i === highlight ? "bg-gray-100 text-black" : "text-gray-700"
                  } ${isSelected ? "font-medium text-black" : ""}`}
                >
                  {o.label}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}

export default SearchableSelect;
