import { useCallback, useEffect, useMemo, useState } from "react";
import {
  matchPath,
  NavLink,
  Outlet,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { loadLayers } from "../data/loaders/layers";
import { CommandPalette } from "./CommandPalette";
import { ConsoleBreadcrumb } from "./ConsoleBreadcrumb";

/** Breadcrumb params from the URL (works with BrowserRouter; avoid useMatches — data router only in RR v7). */
function useCrumbParams(): {
  layerId: string | undefined;
  companySlug: string | undefined;
} {
  const { pathname } = useLocation();
  return useMemo(() => {
    const companyMatch = matchPath(
      { path: "/layer/:layerId/company/:slug", end: true },
      pathname,
    );
    const layerMatch = matchPath(
      { path: "/layer/:layerId", end: true },
      pathname,
    );
    return {
      layerId:
        companyMatch?.params.layerId ?? layerMatch?.params.layerId,
      companySlug: companyMatch?.params.slug,
    };
  }, [pathname]);
}

export function AppShell() {
  const navigate = useNavigate();
  const { layerId, companySlug } = useCrumbParams();
  const { layers } = loadLayers();
  const [paletteOpen, setPaletteOpen] = useState(false);

  const openPalette = useCallback(() => setPaletteOpen(true), []);
  const closePalette = useCallback(() => setPaletteOpen(false), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (paletteOpen) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const t = e.target as HTMLElement | null;
      if (
        t &&
        (t.tagName === "INPUT" ||
          t.tagName === "TEXTAREA" ||
          t.isContentEditable)
      ) {
        return;
      }
      if (e.key >= "1" && e.key <= "9") {
        const i = parseInt(e.key, 10) - 1;
        if (layers[i]) {
          e.preventDefault();
          navigate(`/layer/${layers[i].id}`);
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [layers, navigate, paletteOpen]);

  return (
    <div className="console">
      <aside className="console__rail" aria-label="Primary">
        <div className="console__rail-head">
          <NavLink
            className={({ isActive }) =>
              isActive
                ? "console__brand console__brand--active"
                : "console__brand"
            }
            to="/"
            end
          >
            p3 map
          </NavLink>
        </div>
        <p className="console__rail-label">Layers</p>
        <nav className="console__nav" aria-label="Value chain layers">
          <ul className="console__nav-list">
            {layers.map(({ id, title }) => (
              <li key={id}>
                <NavLink
                  className={({ isActive }) =>
                    isActive
                      ? "console__nav-link console__nav-link--active"
                      : "console__nav-link"
                  }
                  to={`/layer/${id}`}
                >
                  {title}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      <div className="console__main">
        <header className="console__top mono">
          <ConsoleBreadcrumb layerId={layerId} companySlug={companySlug} />
          <div className="console__top-actions">
            <button
              type="button"
              className="console__search-btn"
              onClick={openPalette}
            >
              Search
              <kbd className="console__kbd">⌘K</kbd>
            </button>
          </div>
        </header>
        <div className="console__outlet">
          <Outlet />
        </div>
      </div>

      <CommandPalette open={paletteOpen} onClose={closePalette} />
    </div>
  );
}
