# BudgetModule

Inline content for the Budget & Cost module toggle row in the event creation/edit form.

## Route

n/a — rendered as a child of `ModuleToggleRow` inside `EventConfigForm` at `/admin/events/new` and `/admin/events/:eventId/edit`.

## Key files

| File | Purpose |
|---|---|
| `index.tsx` | `BudgetModule` component + local `CategoryRow` sub-component |
| `constants.ts` | `DEFAULT_BUDGET_CATEGORIES` — five built-in categories |

## Endpoints

| Method | Path | When |
|---|---|---|
| `POST` | `/api/ai/estimate-budget` | On "Estimate with AI" button click |
| `PATCH` | `/api/events/:eventId/budget` | On form submit (wired in `EventConfigForm`) |

## Hooks used

- `useEstimateBudget()` — calls Gemini to estimate cost per category

## Status

- [x] Per-category toggle (enabled/disabled)
- [x] Cap (max allocation) input per category — reactive total
- [x] "Estimate with AI" button — populates ai_estimate + pre-fills cap
- [x] Admin can override any cap value
- [x] Running total max updates reactively as caps/toggles change
- [x] Disabled categories excluded from total
- [x] Custom category add/remove
- [x] Save budget on event create submit — non-blocking call after createEvent resolves
- [ ] Pre-populate from GET /events/:eventId/budget in edit mode

## Notes

- `ai_estimate` is shown as a read-only reference on each row; running "Estimate with AI" pre-fills the cap with the estimate value so the admin has a starting point to override.
- The "Estimate with AI" button is disabled if no categories are enabled or `date_start` is not yet filled.
- Custom categories carry `is_custom: true` and show a remove button.
