---
description: TypeScript conventions for the entire project
alwaysApply: true
---

# TypeScript conventions

## Clean Code principles

- Replace hard-coded values with named constants — keep constants at file top or in a dedicated file
- Variables, functions, and types reveal their purpose — avoid abbreviations unless universally understood
- Each function does exactly one thing — if it needs a comment to explain what it does, split it
- Don't repeat yourself — extract repeated code into reusable functions
- Don't comment what code does — comment *why* something is done a certain way

## TypeScript style

- Prefer **`type`** over `interface`
- Avoid explicit types when TypeScript can infer them
- No `any` — use `unknown` and narrow explicitly
- No non-null assertion (`!`) — handle nullability with conditionals or optional chaining
- TypeScript strict mode always on
- No native `enum` — use `const` objects with `as const` and a derived type:

```typescript
// NO
enum Status { Active = 'active', Inactive = 'inactive' }

// YES
const Status = { Active: 'active', Inactive: 'inactive' } as const
type Status = (typeof Status)[keyof typeof Status]
```

## Type naming and JSDoc

- **PascalCase** for all type names
- Props types use a descriptive suffix: `CreateEventFormProps`, `AttendeeCardProps`
- All exported types and their fields should have **JSDoc in English**:

```typescript
/** Props for the CreateEventForm component. */
export type CreateEventFormProps = {
  /** Called on successful submission. */
  onSuccess: () => void
}
```

- Use `z.infer<typeof Schema>` as the source of truth for form and API payload types — never duplicate manually

## Specific type conventions

- Prefer **`undefined`** for optional or absent values — use **`null`** only when an external API explicitly returns it
- Always narrow errors in `catch` — caught errors are `unknown`:

```typescript
try {
  await doSomething()
} catch (error) {
  if (error instanceof Error) console.error(error.message)
}
```

## File organization

- Define all entity types in `src/types/` — one file per domain (`event.ts`, `participant.ts`, etc.)
- Split files at ~300 lines — use barrel `index.ts` so existing imports keep working
- Use absolute imports (`@/...`) for cross-feature references; relative imports (`./`, `../`) within the same feature

## Imports

- Import order: external libraries → internal modules → types
- Prefer barrel imports (`from '@/services'`) for module-level directories
