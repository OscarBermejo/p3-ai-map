import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { loadCompanyIndex } from "../data/loaders/companyIndex";
import { loadLayers } from "../data/loaders/layers";
import { formatCompanySlug } from "../utils/formatCompanySlug";

type PaletteItem =
  | {
      kind: "layer";
      id: string;
      title: string;
      path: string;
      searchText: string;
    }
  | {
      kind: "company";
      slug: string;
      displayName: string;
      layerId: string;
      layerTitle: string;
      path: string;
      searchText: string;
    };

type CommandPaletteProps = {
  open: boolean;
  onClose: () => void;
};

function buildItems(): PaletteItem[] {
  const { layers } = loadLayers();
  const { companies } = loadCompanyIndex();
  const layerTitle = new Map(layers.map((l) => [l.id, l.title]));

  const layerItems: PaletteItem[] = layers.map((l) => ({
    kind: "layer",
    id: l.id,
    title: l.title,
    path: `/layer/${l.id}`,
    searchText: `${l.id} ${l.title}`.toLowerCase(),
  }));

  const companyItems: PaletteItem[] = companies.map((c) => {
    const displayName = formatCompanySlug(c.slug);
    const lt = layerTitle.get(c.layer) ?? c.layer;
    return {
      kind: "company",
      slug: c.slug,
      displayName,
      layerId: c.layer,
      layerTitle: lt,
      path: `/layer/${c.layer}/company/${c.slug}`,
      searchText: `${c.slug} ${displayName} ${c.layer} ${lt}`.toLowerCase(),
    };
  });

  return [...layerItems, ...companyItems];
}

export function CommandPalette({ open, onClose }: CommandPaletteProps) {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [highlight, setHighlight] = useState(0);

  const allItems = useMemo(() => buildItems(), []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return allItems;
    return allItems.filter((it) => it.searchText.includes(q));
  }, [allItems, query]);

  useEffect(() => {
    setHighlight(0);
  }, [query, open]);

  useEffect(() => {
    if (open) {
      setQuery("");
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  const go = useCallback(
    (path: string) => {
      navigate(path);
      onClose();
    },
    [navigate, onClose],
  );

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setHighlight((h) => Math.min(h + 1, Math.max(0, filtered.length - 1)));
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setHighlight((h) => Math.max(h - 1, 0));
        return;
      }
      if (e.key === "Enter" && filtered[highlight]) {
        e.preventDefault();
        go(filtered[highlight].path);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, filtered, highlight, go, onClose]);

  if (!open) return null;

  return (
    <div className="palette" role="dialog" aria-modal="true" aria-label="Search">
      <button
        type="button"
        className="palette__scrim"
        onClick={onClose}
        aria-label="Close search"
      />
      <div className="palette__panel mono">
        <label className="palette__label" htmlFor="palette-input">
          Go to layer or company
        </label>
        <input
          id="palette-input"
          ref={inputRef}
          className="palette__input"
          type="search"
          autoComplete="off"
          spellCheck={false}
          placeholder="Type to filter…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <ul className="palette__list" role="listbox">
          {filtered.length === 0 ? (
            <li className="palette__empty">No matches</li>
          ) : (
            filtered.map((it, i) => (
              <li key={`${it.kind}-${it.kind === "layer" ? it.id : it.slug}`}>
                <button
                  type="button"
                  role="option"
                  aria-selected={i === highlight}
                  className={
                    i === highlight
                      ? "palette__row palette__row--active"
                      : "palette__row"
                  }
                  onMouseEnter={() => setHighlight(i)}
                  onClick={() => go(it.path)}
                >
                  <span className="palette__kind">
                    {it.kind === "layer" ? "Layer" : "Company"}
                  </span>
                  <span className="palette__title">
                    {it.kind === "layer" ? it.title : it.displayName}
                  </span>
                  {it.kind === "company" ? (
                    <span className="palette__meta">{it.layerTitle}</span>
                  ) : null}
                </button>
              </li>
            ))
          )}
        </ul>
        <p className="palette__hint">
          <kbd className="palette__kbd">↑</kbd>
          <kbd className="palette__kbd">↓</kbd> select ·{" "}
          <kbd className="palette__kbd">Enter</kbd> open ·{" "}
          <kbd className="palette__kbd">Esc</kbd> close
        </p>
      </div>
    </div>
  );
}
