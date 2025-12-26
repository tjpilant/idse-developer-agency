# Status Browser + Puck Integration Recipe

This recipe captures the working pattern we implemented for the Status Browser feature using a JSON-backed page model, Puck editor/view routes, and governance checks.

## Core Pattern
- **Data model:** JSON `PageData` with `schemaVersion`, `slug`, `title`, and a `root` component tree (`ComponentData` with `id`, `type`, `props`).
- **Routes:** view at `/<slug>`, edit at `/<slug>/edit` (homepage slug `index` → `/`).
- **Storage:** JSON files under `data/puck_pages/` keyed by slug.
- **Save/load:** Editor uses `onPublish(data)` to write full JSON; view route reads the same JSON.

## Components & Layout
- Base components: `DashboardLayout`, `StatusHeader`, `StatusCard`, `TextBlock`.
- Layouts with slots: `GridLayout` (`items`, `columns`, `gap`), `ColumnLayout` (`left`, `right`, `ratio`).
- Status Browser widget fix: trigger in column 1, selector + status content in column 2 via a small drawer/portal (no cramped single column).

## Governance & Validation
- Run validators per session and record reports:
  - `python3 idse-governance/validate-artifacts.py --project <project> --session <session> --report-dir reports/projects/<project>/sessions/<session>`
  - `python3 idse-governance/check-compliance.py --project <project> --session <session> --report-dir ...`
  - `python3 idse-governance/audit-feedback.py --project <project> --session <session> --report-dir ...`
- Update `REPORTS_INDEX.json` under `implementation/projects/<project>/sessions/<session>/` with report paths and status.
- Agent tools available: `ValidateArtifactsTool`, `CheckComplianceTool`, `AuditFeedbackTool` (call the scripts and collect logs).

## Usage Steps (quick start)
1) Create a session: `scripts/bootstrap_idse_session.sh Project_Status_Browser session-XXXX` (or your project/session).
2) Set routes: view `/<slug>`, edit `/<slug>/edit`, homepage slug `index`.
3) Store pages: JSON files in `data/puck_pages/<slug>.json`.
4) Editor save: wire `onPublish(data)` to write the JSON; view reads the same file.
5) Run governance validators; ensure `REPORTS_INDEX.json` points to the latest reports.

## Edit / Save / Load Flow
- View route: `/<slug>` reads `data/puck_pages/<slug>.json` and renders via the component registry.
- Edit route: `/<slug>/edit` loads the same JSON, lets you modify it, and saves via `onPublish`.
- Save handler example:
  ```ts
  const save = (data) => {
    writeFile(`/data/puck_pages/${data.slug}.json`, JSON.stringify(data, null, 2));
  };

  export function Editor() {
    return <Puck config={config} data={initialData} onPublish={save} />;
  }
  ```
- Slug `index` maps to `/`; re-saves update the same slug (no duplicates).
- Status Browser widget: trigger in column 1; selector + status content in column 2 via small drawer/portal.

## Notes & Gotchas
- Keep governance logic separate (`idse-governance/`); don’t embed it in app code.
- Slug stability: saving should update the same slug, not create duplicates.
- Layout: ensure the Status Browser widget uses the two-column layout (trigger left, selector/status right).
- Tracing: disable by default (`ENABLE_TRACING=1` to opt in) to avoid retry spam when collectors are down.
