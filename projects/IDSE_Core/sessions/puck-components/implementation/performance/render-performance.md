# Task 2.8 — Render Performance Benchmark

Purpose: Outline how to measure render performance for Puck blocks and slot-heavy pages (target: 60fps for 50+ components).

## Approach
- Use React Profiler or browser Performance tab to measure render commits when rendering a PageData fixture with ~50 nodes (e.g., Grid with nested Cards).
- Capture FPS and commit durations; look for expensive re-renders in Slot-heavy blocks.

## Steps
1) Create a synthetic PageData fixture with nested Grid/Card/Text blocks (50+ nodes).
2) Render via a simple mapper (component key → render) in a test harness.
3) Profile initial render and an update (e.g., change a prop) to observe commit times.
4) Ensure memoization where appropriate (avoid unnecessary re-renders for static props).

## Notes
- Keep styling minimal in the benchmark to isolate component render cost.
- Record results and regressions; set a budget (<50ms per commit target).
- For Puck editor usage, also test drag/drop/inline edits if available in app harness (outside this doc).
