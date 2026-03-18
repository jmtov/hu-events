---
name: refactor-to-conventions
description: Review existing code against project conventions and refactor it step by step. Use when asked to "refactorizar", "estandarizar", "limpiar código", or when code needs to align with conventions.
---

# Skill: Refactor code to match conventions

When the user asks to refactor, standardize, or clean up existing code, follow this procedure to align it with the project conventions defined in `.cursor/rules/file-types/` (`react.mdc`, `typescript.mdc`, `dashboard.mdc`).

## When to use

- User asks to "refactorizar" or "estandarizar" code
- User asks to "limpiar" or "mejorar" existing code
- User points to code that doesn't follow conventions
- Code review reveals convention violations

## Steps

### 1. Identify scope

Ask the user (if not clear):
- Which **file, folder, or module** to review?
- Any **specific concerns** (structure, naming, performance, etc.)?

### 2. Read and analyze

- Read the target file(s) completely
- Compare against conventions from `.cursor/rules/file-types/` (`react.mdc`, `typescript.mdc`, `dashboard.mdc`)
- Categorize findings by type:

| Category | What to look for |
|----------|------------------|
| **Structure** | File too large (>300 lines), wrong location, missing barrel |
| **Naming** | Non-PascalCase folders, unclear function names, abbreviations |
| **Code style** | Magic numbers, hardcoded strings, logic in components |
| **React patterns** | Missing hooks extraction, prop drilling, wrong form patterns |
| **Types** | Missing types, duplicated types, `interface` instead of `type` |

### 3. Present findings

Output a summary table:

```markdown
## Findings for `path/to/file.tsx`

| # | Issue | Convention violated | Severity |
|---|-------|---------------------|----------|
| 1 | File has 450 lines | Split at ~300 lines | Medium |
| 2 | Magic number `86400` | Use named constant | Low |
| 3 | Business logic in render | Move to hook/util | High |
```

**Do not start refactoring yet.** Wait for user to review and prioritize.

### 4. Propose refactoring plan

Based on user feedback, create a numbered plan:

```markdown
## Refactoring plan

1. Extract business logic to `hooks/useFeatureLogic.ts`
2. Create `constants.ts` with `SECONDS_PER_DAY = 86400`
3. Split component into main + 2 subcomponents in `components/`
```

Get user confirmation before proceeding.

### 5. Execute one step at a time

- Implement **one plan item** at a time
- After each step: summarize what changed, show key code
- **Wait for user validation** before next step
- If user questions a change, re-evaluate and adjust

### 6. Final review

After all steps:
- List all files modified
- Confirm conventions are now followed
- Note any remaining tech debt or future improvements

---

## Quick checks (cheatsheet)

Use this checklist when analyzing code:

### File structure
- [ ] File under 300 lines (or split by domain)
- [ ] Components have `index.tsx` entry
- [ ] Subcomponents in `components/` folder
- [ ] Forms in `forms/` with proper structure

### Naming
- [ ] Folders are PascalCase
- [ ] Functions/variables reveal purpose
- [ ] No unexplained abbreviations

### Code style
- [ ] No magic numbers (use constants)
- [ ] No hardcoded strings (use constants/i18n)
- [ ] No business logic in component body
- [ ] Uses `sx` not `style`
- [ ] Uses `Stack` not `Box` for layout

### React patterns
- [ ] Functional components only
- [ ] Reusable logic in custom hooks
- [ ] react-hook-form with Controller
- [ ] React Query with `select` for mapping
- [ ] Proper dependency arrays

### TypeScript
- [ ] Uses `type` not `interface`
- [ ] Props are typed
- [ ] No unnecessary explicit types

---

## Example flow

1. User: "Refactor this file: `src/pages/dashboard/Goals/List/index.tsx`"
2. Agent: Reads file, analyzes against conventions, outputs findings table
3. Agent: "Found 4 issues. Want me to put together a refactoring plan?"
4. User: "Yes, go ahead"
5. Agent: Proposes numbered plan, waits for confirmation
6. User: "Let's start with point 1"
7. Agent: Executes step 1, summarizes, waits
8. User: "Ok, next"
9. Agent: Continues until done
