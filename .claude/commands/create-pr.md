---
description: Generates a ready-to-copy Pull Request title and description based on the current branch changes compared to the remote base branch.
---

# /create-pr

You are a PR creation assistant. All title formats, body templates, label rules, and conventions are in **`.cursor/rules/workflows/pull-request-template.mdc`** — follow those rules strictly. Do not redefine them here.

When this command is triggered, execute these steps **in order**.

---

## Step 1 — Detect the base branch

```bash
git branch -r | grep -E 'origin/(develop|main|master)' | head -5
```

Use `origin/develop` if it exists, otherwise fall back to `origin/main` or `origin/master`.

---

## Step 2 — Get the current branch and Jira ticket

```bash
git branch --show-current
```

Try to extract a Jira ticket from the branch name:
- `feature/SQ-123-some-description` → `SQ-123`
- `fix/SQ-456-some-fix` → `SQ-456`

---

## Step 3 — Collect the diff against the remote base branch

```bash
git fetch origin <BASE_BRANCH> && git diff origin/<BASE_BRANCH>...HEAD --stat && git log origin/<BASE_BRANCH>...HEAD --oneline
```

Identify which files changed and which modules are affected by mapping paths under `src/pages/dashboard/*` to their module name.

If the branch has no commits ahead of the base, stop and inform the user.

---

## Step 4 — Output the PR title and description

Using the diff, the flow answer, and the rules from `pull-request-template.mdc`, output the following two clearly labeled blocks for the user to copy/paste into GitHub.

### PR Title

```
type(scope): [TICKET] short description
```

### PR Description

Output the full markdown body with:
- **Summary** auto-filled from the diff and commit messages, **formatted with markdown** (see Summary format below)
- **Jira Card** pre-filled with the ticket from Step 2 (or left as placeholder if none found)
- All other sections left as placeholders for the user to fill
- **Do NOT include** the "Flow" section (Regular/Hotfix/Bugfix checkboxes) or the "Required Label Reminder" section — omit them from the output

**Summary format (use markdown, not raw paragraphs):**
- Start with one short introductory sentence (optional).
- Use **bullets** for each distinct change or area (e.g. new files, commands, config).
- Use **bold** for labels/names (e.g. file names, command names, module names).
- Keep it scannable: 2–6 bullet points preferred over a single long paragraph.
- Stay factual and concise; no invention.

```markdown
## Summary

<auto-filled: short intro if needed, then bullet list with **bold** terms where helpful>

## Screenshots, GIFs or Videos

<!-- Add screenshots or videos of the views you modified -->

## Jira Card

[TICKET-NN](https://humand.atlassian.net/browse/TICKET-NN)

## Additional Context (optional)

<!-- Add any other relevant information here -->
```

## Rules

- Always run the git commands before generating any output.
- Never make up file changes — only summarize what the diff actually shows.
- Format the Summary with markdown: use bullet lists and **bold** for key names; avoid a single long raw paragraph.
- Keep the Summary factual and concise — 2 to 6 bullet points (or equivalent) max.
- If multiple modules are affected, use the most impacted one as the scope, or `tech` for broad changes.
- Output the title and body as separate, clearly labeled copy/paste blocks.
- Do NOT run `gh` commands. Do NOT create the PR. Only output markdown.
- Do NOT include Flow or Required Label Reminder in the PR description; only output Summary, Screenshots, Jira Card, and Additional Context.
