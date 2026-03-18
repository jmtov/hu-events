---
name: split-module-services-or-types
description: Split a large services.ts or types.ts in a dashboard module by domain, with a barrel index so existing imports keep working. Use when the file is 300+ lines or the user asks to split/refactor it.
---

# Skill: Split a large services.ts or types.ts in a dashboard module

When a module's `services.ts` or `types.ts` has grown too large (e.g. 300+ lines or many unrelated domains), split it and keep imports working. Reference: `.cursor/rules/file-types/dashboard.mdc` §5.

## For services.ts

1. **Create `services/`** next to the current `services.ts` (or replace the file with the folder).
2. **Split by domain** into one file per area, e.g.:
   - `services/process.ts`
   - `services/steps.ts`
   - `services/actions.ts`
   - `services/assignments.ts`
   - `services/journeys.ts`
   - `services/reports.ts`
   (Adjust names to match the actual domains in the file.)
3. **Add `services/index.ts`** that re-exports everything from the split files. No new logic in the barrel.
4. **Update imports** in the module: keep `from '../services'` or `from '../../services'`; they should resolve to the barrel.
5. **Remove** the old single `services.ts` if it was replaced by the folder.

## For types.ts

1. **Create `types/`** next to the current `types.ts` (or replace the file with the folder).
2. **Split by domain** into one file per area, e.g.:
   - `types/process.ts`
   - `types/step.ts`
   - `types/action.ts`
   - `types/assignment.ts`
   - `types/journey.ts`
   (Adjust to match the types in the file.)
3. **Add `types/index.ts`** that re-exports everything from the split files.
4. **Update imports** in the module to keep using `from '../types'` or `from '../../types'` so they use the barrel.
5. **Remove** the old single `types.ts` if it was replaced by the folder.

## Cross-references

- Types in `services/<domain>.ts` should import from the module's `types` (barrel) or from `types/<domain>.ts` if needed to avoid cycles.
- Keep section comments in the new files if they help (e.g. `// --- Process ---`).
