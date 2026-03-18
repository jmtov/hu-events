---
description: Routing and data fetching conventions using TanStack Router and TanStack Query
alwaysApply: true
---

# Routing & data fetching conventions

## Feature structure

Each feature lives at `src/features/<domain>/` with:

- **Shared files at root**: `types.ts`, `services.ts`, `constants.ts`
- **One folder per screen/sub-feature**: e.g. `List/`, `Detail/`, `Form/`
- **Screen folders have**: `index.tsx` (entry), `components/`, optionally `hooks/`, `forms/`

```
src/features/events/
├── types.ts
├── services.ts
├── constants.ts
├── List/
│   ├── index.tsx
│   └── components/
└── Detail/
    ├── index.tsx
    ├── components/
    └── forms/
```

## Where to put new code

| Adding | Location |
|---|---|
| New screen | `src/features/<domain>/ScreenName/index.tsx` |
| New component for a screen | `ScreenName/components/ComponentName/index.tsx` |
| New form | `ScreenName/forms/FormName/` (one folder per form) |
| Types (feature-only) | That feature's `types.ts` |
| Types (shared across features) | `src/types/<domain>.ts` |
| API service (feature-only) | Feature root `services.ts` |
| API service (shared) | `src/services/<domain>.ts` |
| Query / mutation hook | `src/hooks/useGetX.ts`, `src/hooks/useCreateX.ts` |

## TanStack Router

- All routes are defined under `src/routes/` using file-based routing
- Route files follow the naming convention: `index.tsx`, `$param.tsx`, `_layout.tsx`
- Use `<Link>` or `router.navigate()` for all navigation — never `window.location` or `<a href>`
- Route params are always typed — use `Route.useParams()` to access them
- Auth-protected routes wrap their content with a guard component
- Route files are thin — they import the feature component and pass route params as props

**Route structure:**
```
src/routes/
  __root.tsx
  index.tsx                        # / redirect
  _auth.tsx                        # auth guard layout
  _auth/
    admin/
      events/
        index.tsx                  # /admin/events
        new.tsx                    # /admin/events/new
        $eventId/
          index.tsx                # /admin/events/:eventId
          checklist.tsx
          budget.tsx
          notifications.tsx
          dashboard.tsx
    attendee/
      events/
        $eventId.tsx               # /attendee/events/:eventId
  join/
    $eventId.tsx                   # /join/:eventId (public)
```

## TanStack Query

- All server state lives in TanStack Query — no `useEffect` + `useState` for data fetching
- Every query and mutation is encapsulated in a custom hook in `src/hooks/`
- Naming: `useGetX()` for queries, `useCreateX()` / `useUpdateX()` / `useDeleteX()` for mutations
- Always call `queryClient.invalidateQueries()` after a successful mutation
- Always handle `isLoading` and `isError` states in the component — never render data that might be undefined without a guard

**Query hook example:**
```ts
// src/hooks/useGetEvent.ts
export const useGetEvent = (eventId: string) =>
  useQuery({
    queryKey: ['events', eventId],
    queryFn: () => eventService.getById(eventId),
    enabled: !!eventId,
  })
```

**Mutation hook example:**
```ts
// src/hooks/useCreateEvent.ts
export const useCreateEvent = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: eventService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] })
    },
  })
}
```

## API service layer

- The frontend only calls `/api/...` routes via the shared `src/lib/api.ts` client — never external URLs directly
- Each domain has a service file in `src/services/` (e.g. `src/services/events.ts`)
- Services are plain async functions — no raw `fetch()` or `axios` calls inside components or hooks

## File size and splitting

- Prefer files under ~300 lines
- **`services.ts`** → `services/<domain>.ts` + `services/index.ts` barrel
- **`types.ts`** → `types/<domain>.ts` + `types/index.ts` barrel
- **Big components (400+ lines)** → extract into subcomponents under `components/`
- Barrel files only re-export — no new logic
