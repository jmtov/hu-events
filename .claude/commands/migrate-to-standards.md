---
description: Migrates existing code to align with project conventions (TypeScript, React, TanStack Form, TanStack Query, TanStack Router)
alwaysApply: false
---

# Migrate existing code to project standards

You are refactoring existing code to align it with the project conventions defined in `typescript.mdc`, `react.mdc`, `forms.mdc`, and `dashboard.mdc`. Do not add new features — only bring the existing code up to standard.

## Process

Work file by file. For each file:
1. Read the file and identify every violation of the project conventions
2. List the violations before making any changes
3. Apply the fixes
4. Confirm what was changed

Never delete logic or functionality — only restructure and retype it.

---

## What to fix

### TypeScript
- Replace every `any` with a proper type or `unknown` with narrowing
- Add missing return types to exported functions
- Remove non-null assertions (`!`) and handle nullability explicitly
- Create missing type definitions in `src/types/` if the entity doesn't have one yet
- Replace manually written types that duplicate a Zod schema with `z.infer<typeof Schema>`

### React
- Convert class components to functional components
- Remove `React.FC` and type function props directly with a named interface
- Replace `../../../` deep relative imports with absolute imports from `src/`
- Split any component over ~150 lines into smaller focused components
- Ensure every list render has a stable, meaningful `key` prop (never array index unless the list is static)

### Forms
- Replace any form built with `useState` fields with TanStack Form + `useForm()`
- Replace any validation logic built with `react-hook-form` or manual checks with a Zod schema in `src/schemas/`
- Connect the schema to TanStack Form via `@tanstack/zod-form-adapter`
- Ensure every field shows its error message via `field.state.meta.errors`
- Ensure the submit button is disabled while `form.state.isSubmitting` is true

### Data fetching
- Replace every `useEffect` + `useState` data fetch with a TanStack Query hook in `src/hooks/`
- Move any raw `fetch()` or `axios` call inside a component or hook into a service function in `src/services/`
- Ensure every mutation calls `queryClient.invalidateQueries()` on success
- Ensure every component that fetches data handles `isLoading` and `isError` explicitly

### Routing
- Replace any `window.location` or `<a href>` used for internal navigation with TanStack Router's `<Link>` or `router.navigate()`
- Ensure route params are accessed via `Route.useParams()` and are typed

---

## What NOT to change
- Business logic and feature behavior
- API endpoint URLs
- Any file that already follows the conventions — skip it and say so

## Screen structure
- Cross-reference each screen against the feature definitions in the technical documentation
- If a screen covers more than one feature (e.g. participant list + preference fields in the same component), split it into separate components under the corresponding feature folder
- Each route should map to exactly one feature — if a route file is doing the work of two features, extract the second into its own route or sub-component
