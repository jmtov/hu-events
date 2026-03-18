---
description: Commit message and pull request conventions
alwaysApply: true
---

# Commit and PR conventions

## Commit messages

Follow [Conventional Commits](https://www.conventionalcommits.org/). Every commit message must have the form:

```
<type>(<scope>): <description>
```

### Types

| Type | When to use |
|---|---|
| `feat` | New feature or screen |
| `fix` | Bug fix |
| `chore` | Dependencies, config, tooling — no production code change |
| `refactor` | Code restructure with no behaviour change |
| `style` | Formatting, naming — no logic change |
| `docs` | README, comments, convention files only |
| `i18n` | Adding or updating translation keys |

### Scope

The affected area of the codebase — keep it short and lowercase:

| Scope | Covers |
|---|---|
| `attendee` | Attendee feature |
| `admin` | Admin feature |
| `events` | Events module |
| `auth` | Authentication |
| `ui` | Shared components (`src/components/`) |
| `infra` | Vercel functions, n8n, serverless |
| `config` | Biome, TypeScript, Vite, Vercel config |
| `deps` | Dependency changes |

Scope is optional for cross-cutting changes.

### Description

- Imperative mood, lowercase, no period: `add attendee registration form` not `Added form.`
- 72 characters max
- Describe **what** changed, not **how**

### Examples

```
feat(attendee): add registration form with RSVP flow
fix(auth): redirect to login when session expires
chore(deps): update zod to v4 and remove lucide-react
refactor(ui): migrate form components to react-hook-form
i18n(attendee): add es and pt-BR translations for registration screen
docs(config): document shadcn ui folder as auto-generated
```

### Multi-line commits

Add a body only when the **why** is not obvious from the description:

```
refactor(forms): switch from tanstack-form to react-hook-form

TanStack Form's createFormHook API requires a circular import between
the form hook and field components that cannot be resolved cleanly.
React Hook Form's FormProvider + useFormContext pattern avoids this
and reduces boilerplate significantly.
```

---

## Pull requests

### Title

Same format as a commit message: `type(scope): description`.

### Description template

Every PR must include:

```markdown
## What

<!-- One paragraph: what this PR does and why. -->

## Changes

<!-- Bullet list of the most important changes. -->

## How to test

<!-- Steps to verify the feature or fix works. -->
```

### Rules

- One concern per PR — do not mix features with refactors or dependency updates
- PRs that add a new screen must include the route and a brief description of the data flow
- Link the relevant ticket or issue when one exists
