---
description: Form and validation conventions using React Hook Form + Zod
alwaysApply: true
---

# Forms & validation conventions

## Stack

- **React Hook Form** for all form state — never use `useState` for form fields
- **Zod** for all validation schemas
- **`@hookform/resolvers/zod`** to connect Zod schemas to RHF

## Naming

- Every form component must be named `<Domain>Form` — e.g. `CreateEventForm`, `AttendeeRegistrationForm`
- The filename must match: `CreateEventForm.tsx`

## File structure

Every non-trivial form lives in its own folder under `forms/`:

```
Feature/
└── forms/
    └── MyForm/
        ├── index.tsx        # component entry
        ├── types.ts         # form-specific types
        ├── schemas.ts       # Zod schema
        └── utils/
            ├── values.ts    # getDefaultValues(), getDefaultValuesFromApi()
            └── transforms.ts  # form ↔ API payload conversions
```

Simple forms (≤ 3 fields, no async data) can be a single file.

## Schema files

- Every form has a Zod schema defined in `schemas.ts` (or `src/schemas/<domain>.ts` for shared schemas)
- Schema is the single source of truth — infer the form type from it: `type CreateEventValues = z.infer<typeof createEventSchema>`
- Never duplicate type definitions that can be inferred from a schema
- Reuse partial schemas with `z.pick()` or `z.omit()` when a form covers a subset of an entity

## Form setup

Use `useForm` from `react-hook-form` with `zodResolver`. Pass `<FormProvider>` down to give field components access via context.

```tsx
import { useForm, FormProvider } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createEventSchema } from './schemas'
import type { CreateEventValues } from './schemas'

const form = useForm<CreateEventValues>({
  resolver: zodResolver(createEventSchema),
  defaultValues: { title: '', description: '' },
})

return (
  <FormProvider {...form}>
    <form onSubmit={form.handleSubmit(onSubmit)}>
      ...
    </form>
  </FormProvider>
)
```

## Field setup

Use `FormInput` from `@/components/Input/form` — no `control` prop, no `Controller` boilerplate, no manual error wiring. It reads everything via `useFormContext()` internally:

```tsx
<FormInput name="title" label="Title" placeholder="Ex: Team Offsite" required />
<FormInput name="description" label="Description" />
```

## Input components

| Component | Path | When to use |
|---|---|---|
| `Input` | `@/components/Input` | Standalone input with label/hint/error — not connected to a form |
| `FormInput` | `@/components/Input/form` | Inside a `<FormProvider>` — handles Controller + error display automatically |

## Error display

- `FormInput` reads `fieldState.error?.message` and passes it to `Input` automatically
- If building a custom field, use `Controller` from RHF and read `fieldState.error?.message` directly — it's always a string

## Default values vs values

- Use **`defaultValues`** in creation flows — data is set once when the form mounts
- Use **`defaultValues` from a loaded query** in edit flows — pass the already-fetched data in

## Async data (edit forms)

The form component must never fetch data itself. Use a Provider pattern:

```
MyFormProvider   ← fetches query, handles loading/error, transforms to form shape
  └── MyForm     ← receives defaultValues as prop, never fetches, never calls reset()
```

## Submission

`onSubmit` must be thin — just call the mutation with the raw form values. The `mutationFn` owns the full pipeline: transform, validate output shape, call the API.

```tsx
// YES — onSubmit passes raw values; mutation owns transform + request
const onSubmit = async (values: CreateEventValues) => {
  await createEvent.mutateAsync(values)
}

// mutation definition
const useCreateEvent = () =>
  useMutation({
    mutationFn: (data: CreateEventValues) => {
      const payload = transformFormToRequest(data)
      return api.post('/events', payload)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] })
    },
  })
```

- `transformFormToRequest` lives in `utils/transforms.ts`
- Success callbacks go in the mutation definition, not in `onSubmit`

## Multi-step forms

| Scenario | Pattern |
|---|---|
| Steps are independent (each submits its own data) | One `useForm` per step — each calls `onNextStep(data)` |
| Everything submits at once | Single `useForm` at stepper level; steps read via `useFormContext()` |
| One step drives validation of others | Two contexts — one at stepper level, one per step |

## Rules

- Always show field-level error messages — never only rely on submit-level validation
- Disable the submit button while `form.formState.isSubmitting` is true
- Reset the form after a successful creation submission with `form.reset()`
