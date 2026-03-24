# Local fonts (JetBrains Mono)

WOFF2 files in this folder are served as static assets from `/fonts/…` (Vite **`public/`** root).

## Bundled files

| File | Weight | Source |
|------|--------|--------|
| `jetbrains-mono-latin-400-normal.woff2` | 400 | [@fontsource/jetbrains-mono](https://www.npmjs.com/package/@fontsource/jetbrains-mono) via [jsDelivr](https://www.jsdelivr.com/package/npm/@fontsource/jetbrains-mono) |
| `jetbrains-mono-latin-500-normal.woff2` | 500 | same |
| `jetbrains-mono-latin-700-normal.woff2` | 700 | same |

**License:** [SIL Open Font License 1.1](https://github.com/JetBrains/JetBrainsMono/blob/master/OFL.txt) — JetBrains Mono © JetBrains.

## Refresh or add weights

From repo root (example for 400 latin):

```bash
curl -sSL -o apps/map-ui/public/fonts/jetbrains-mono-latin-400-normal.woff2 \
  "https://cdn.jsdelivr.net/npm/@fontsource/jetbrains-mono@5.2.5/files/jetbrains-mono-latin-400-normal.woff2"
```

Other files live under the same package path: `files/jetbrains-mono-latin-<weight>-normal.woff2` (and `*-italic.woff2` if needed). See the [Fontsource JetBrains Mono page](https://fontsource.org/fonts/jetbrains-mono).

Then add a matching `@font-face` block in `src/index.css`.

## Alternative: npm (no `public/fonts` copies)

You can instead `npm install @fontsource/jetbrains-mono` and `import "@fontsource/jetbrains-mono/400.css"` in `main.tsx`; the bundler emits font assets. This folder approach keeps fonts visible and easy to swap without extra deps.
