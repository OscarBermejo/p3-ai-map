# map-ui

Minimal UI for **p3-ai-map**. **Content** is read only from **`content/`** (via `@repo` → repo root).

## Run

From this directory:

```bash
npm install
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`).

## Current screens

- **Home:** AI value-chain **layers** from `content/_meta/layers.yaml` (order and titles). Edit that file to add/remove/reorder layers; rebuild or refresh dev server to see changes.

## Layout

| Path | Role |
|------|------|
| `src/data/loaders/` | Load & parse YAML from `content/` (`layers.yaml`, etc.) |
| `src/data/types/` | TypeScript shapes for parsed files |
| `src/features/` | Screen-level views (`layers/`, …) |
| `src/components/` | Shared layout |

`vite.config.ts` exposes the monorepo root as `@repo` and allows the dev server to read files under the repo root (for `?raw` imports of YAML).

**Fonts:** JetBrains Mono WOFF2 files live in `public/fonts/` (served at `/fonts/…`). See `public/fonts/README.md` for license and how to refresh weights.

## Next steps

- Per-layer or per-company views using `content/_meta/company_index.yaml` and `content/companies/<slug>/`.
- Routing (e.g. `/layer/:id`, `/company/:slug`).
