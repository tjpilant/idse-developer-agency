# Task 2.10 — Code-Splitting Strategy

Purpose: Document chunking approach to keep bundle sizes manageable and avoid size warnings.

## Current Setup
- Vite (now pinned to ^6) with manualChunks splitting by package (`react`, `@radix-ui/*`, `@measured/puck`, etc.) in `vite.config.ts`.
- Storybook uses the same Vite builder; large vendor chunks split accordingly.

## Recommendations
- Keep manualChunks by package to isolate heavy deps (Radix, Puck, Copilot/Milkdown).
- Consider lazy-loading heavy editor-only features if needed (e.g., import Puck editor routes dynamically).
- Monitor bundle sizes during CI; adjust `chunkSizeWarningLimit` pragmatically (current: 1500).

## Notes
- Safelist and Tailwind CSS do not impact JS chunk size; focus on vendor splits and dynamic imports for large modules.
