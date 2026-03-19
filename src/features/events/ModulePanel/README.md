# ModulePanel

Renders the module toggle panel on the event detail/config page.

## What it does

Displays all 5 event modules as independent, expandable rows. The admin toggles each module on/off. Changes are held in local state and only persisted when the explicit "Save modules" button is clicked.

## Route

`/admin/events/:eventId`

## Key files

| File | Purpose |
|---|---|
| `index.tsx` | Container — manages local toggle state, renders all rows, owns the Save button |
| `ModuleToggleRow.tsx` | Reusable row — Switch + label + smooth collapsible content area |

## Endpoints

| Method | Path | Description |
|---|---|---|
| `PATCH` | `/api/events/:eventId/modules` | Persists the full modules object |

Called via `useUpdateEventModules(eventId)` hook.

## Behaviour notes

- **State isolation:** each module's toggle is fully independent — toggling one never affects another.
- **Explicit save (option B):** no auto-save on toggle. A single Save button sends all module states together via `PATCH`.
- **Conditional mount:** children of a `ModuleToggleRow` are not mounted in the DOM when the module is disabled. When closing, the CSS transition plays first (300 ms), then the children unmount — so the collapse animation is smooth and the DOM stays clean.
- **Animation:** uses the CSS `grid-rows-[0fr→1fr]` trick with `transition-all duration-300` — no extra libraries needed.
- **i18n:** label/description strings are currently hardcoded in English inside `index.tsx`. Translation keys are already defined in `public/locales/*/admin.json` under `events.modules.*` for when the dev front-end wires them up.
