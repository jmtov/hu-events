---
description: Read a Notion ticket and implement the feature it describes
---

# Working from a Notion ticket

Use this skill when someone shares a Notion URL and asks you to work on it.

## Steps

### 1. Fetch the ticket

Use the Notion MCP tool to read the page:

```
notion-fetch → { url: "<notion url>" }
```

Extract from the ticket:
- **What** — the feature or fix being requested
- **Why** — the business context or motivation
- **Acceptance criteria** — what done looks like
- **Scope** — which routes, components, or API endpoints are affected

### 2. Cross-reference with project docs

Before writing any code, read the relevant entries in:

- `docs/technical_docs_plan.md` — find the matching feature (F-01 to F-12); it contains the route, endpoints, hooks, and implementation notes
- `docs/features_list.md` — understand where this fits in the product
- `docs/api_layer.md` — if the ticket touches the API layer or n8n workflows

If the ticket describes something not covered in these docs, ask the user for clarification before proceeding.

### 3. Identify what needs to be built

Map the ticket to concrete files:

| Ticket element | Where it lives |
|---|---|
| New screen | `src/routes/<path>.tsx` |
| Feature component | `src/features/<domain>/` |
| Data fetching | `src/hooks/use<X>.ts` |
| Form | `src/features/<domain>/forms/<Name>Form.tsx` + `src/schemas/<domain>.ts` |
| API call | `src/services/<domain>.ts` → `api/<endpoint>.ts` |
| Translations | `public/locales/{en,es,pt-BR}/<namespace>.json` |

### 4. Implement

Follow all project conventions — TypeScript, React, forms, i18n, commits.

Key reminders:
- Every new screen needs a `README.md` in its feature folder
- Every user-visible string must be in all three locale files (`en`, `es`, `pt-BR`)
- Run `npx tsc -p tsconfig.app.json --noEmit` before committing
- Commit using Conventional Commits: `feat(<scope>): <description>`

### 5. Summarise what was done

After implementing, briefly state:
- What was built and where
- Any decisions made that weren't in the ticket
- Anything that was out of scope and left for a follow-up
