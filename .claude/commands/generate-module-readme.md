---
description: Analyzes a dashboard module and generates or updates a README.md at the module root for quick context when refining tickets. Use when the user wants to document a module or refresh its index.
---

# /generate-module-readme

Generate a **README.md** for a dashboard module so it can be used as quick context when refining Jira tickets or finding where to work.

## Input

- **Target:** The user names a **module** (e.g. under `src/pages/dashboard/<Module>/`) or a **feature folder** under `src/` (e.g. `components/MyFeature`). If unclear, ask: "¿Qué carpeta documentamos? (ej. módulo bajo `src/pages/dashboard/` o carpeta bajo `src/`)"
- **Path:** `src/pages/dashboard/<ModuleName>/` **or** `src/<FeaturePath>/` for smaller apps like hu-events.

## Steps

### 1. Confirm the module exists

- Check that the chosen path exists and list top-level contents (folders and key files like `routes.ts`, `services.ts`, `types.ts` when present).

### 2. Identify screens and flows

- **Top-level folders** under the module are usually main screens or features (e.g. `List/`, `Process/`, `Report/`). For each folder that has an `index.tsx` (or is clearly a feature), treat it as a screen or flow.
- **Routes:** If the module has `routes.ts`, read it to get route names and map them to folders (e.g. `process/new` → `Process/New/`, `process/:id/edit` → `Process/Edit/`). Use this to fill "Screen or flow" names and descriptions.
- **Entry paths:** For each screen/flow, set the entry to the main `index.tsx` (e.g. `List/index.tsx`, `Process/Edit/index.tsx`). If a flow has sub-steps (e.g. stepper with New, Edit, Report), list the sub-flow paths in the same row or add a short note.

### 3. Identify key forms

- Search for form folders: under the module, look for `**/forms/**/index.tsx` or `**/form/**/index.tsx` (and common form folder names like `*Form/` with `index.tsx`).
- Include in the table only forms that are **entry points** for user flows (e.g. configuration modals, main wizards like `SurveyConfigForm`, `CustomTaskForm`). Skip small field components or form parts that are not useful as "where to work" anchors.
- For each, set **Path** to the form folder (e.g. `Process/components/forms/SurveyConfigForm/`).

### 4. Shared assets

- List the files present at the **module root**: `routes.ts`, `services.ts` or `services/`, `types.ts` or `types/`, `queries.ts`, `constants.ts`. Only mention those that exist.

### 5. Write README.md

- Create or overwrite `README.md` at the chosen folder root (e.g. `src/pages/dashboard/<Module>/README.md` or `src/<Feature>/README.md`).
- Follow the structure in **`.cursor/templates/MODULE-README-TEMPLATE.md`**: replace placeholders with the data collected. Use the module’s real screen names, paths, and form names.
- **Description:** One line summarizing what the module is for (e.g. "Employee lifecycle processes: create and edit processes, steps, and survey/custom task actions; view reports."). Infer from routes and folder names if needed.
- Keep tables concise; avoid listing every subcomponent. The goal is **quick context** to know where to start when a ticket says "módulo X, pantalla Y".

### 6. Summarize for the user

- Tell the user the README was generated and where it is. Mention that they can use it as context when refining tickets (e.g. paste or reference it when asking "¿dónde se trabaja esto?").

## Template reference

The exact section order and table columns are in **`.cursor/templates/MODULE-README-TEMPLATE.md`**. Do not invent new sections; stick to Screens/flows, Key forms, and Shared. Add the closing note about updating when screens or forms change.

## Notes

- If the module is very large (many features), it is acceptable to group sub-flows in one row (e.g. "Process (new, edit, report)" with paths listed).
- Prefer **paths relative to the module root** (e.g. `Process/Edit/index.tsx`) so the README stays valid regardless of repo root.
- Language: use **English** for file paths and technical names; description and table text can be in **Spanish** if the team prefers, or English for consistency with code.
