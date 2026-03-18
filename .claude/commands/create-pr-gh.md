---
description: Creates a Pull Request on GitHub from the current branch using the PR template. Runs the same logic as create-pr-description, then executes gh pr create. Use when the user wants to open the PR directly from the CLI.
---

# /create-pr-gh

You are a PR creation assistant. All title formats, body templates, label rules, and conventions are in **`.cursor/rules/workflows/pull-request-template.mdc`** — follow those rules strictly. Do not redefine them here.

When this command is triggered, execute these steps **in order**. This command **creates the PR on GitHub** (unlike `/create-pr-description`, which only outputs title and body for copy/paste).

---

## Step 0 — Check GitHub CLI login

```bash
gh auth status
```

If the command fails or reports that you are not logged in, **stop and inform the user**. Tell them to run `gh auth login` and then run this command again. Do not proceed to Step 1 until `gh auth status` succeeds.

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

Extract the Jira ticket from the branch name (e.g. `feature/SQ-123-foo` → `SQ-123`, `SQGZ-642-dependecies-restriction` → `SQGZ-642`).

---

## Step 3 — Collect the diff against the remote base branch

```bash
git fetch origin <BASE_BRANCH> && git diff origin/<BASE_BRANCH>...HEAD --stat && git log origin/<BASE_BRANCH>...HEAD --oneline
```

Identify which files changed and which modules are affected (e.g. paths under `src/pages/dashboard/*` → module name).

**If the branch has no commits ahead of the base**, stop and inform the user. Do not run `gh pr create`.

---

## Step 4 — Generate PR title and body

Using the diff, commit messages, and the rules from `pull-request-template.mdc`:

1. **Title:** `type(scope): [TICKET] short description` (lowercase, no period at the end). Derive type and scope from the changes; use the ticket from Step 2.
2. **Body:** Build the markdown body with:
   - **Summary** — Auto-filled from the diff and commit messages. Use markdown: bullets, **bold** for file/module names. 2–6 bullet points, factual and concise.
   - **Screenshots, GIFs or Videos** — Placeholder line: `<!-- Add screenshots or videos of the views you modified -->`
   - **Jira Card** — Link with the ticket from Step 2: `[TICKET](https://humand.atlassian.net/browse/TICKET)`. If no ticket found, use `[TICKET-NN](https://humand.atlassian.net/browse/TICKET-NN)`.
   - **Additional Context (optional)** — Placeholder: `<!-- Add any other relevant information here -->`
   - **Do NOT include** the "Flow" or "Required Label Reminder" sections in the body.

---

## Step 5 — Ask the user for labels (before creating the PR)

**Before** running `gh pr create`, ask the user for the labels required by `pull-request-template.mdc`:

1. **Primary label (required — exactly one):**
   Ask: *"Which primary label do you want for this PR?"* and list the options:
   - `talent`
   - `comm`
   - `data`
   - `ops`
   - `people foundation`
   - `time managment`

2. **Flow label (optional):**
   If the PR is a **Bugfix** (merge to release branch) or **Hotfix** (merge to master), ask: *"Is this a Bugfix or Hotfix? If so, add the flow label."*
   - Bugfix → `stg fix`
   - Hotfix → `hot fix`
   - Regular flow → no additional label.

Do not run `gh pr create` until the user has provided at least the primary label. Then use these labels in Step 6 with `--label`.

---

## Step 6 — Create the PR with GitHub CLI

1. Write the **body** (the full markdown from Step 4) to a temporary file, e.g. `.cursor/.pr-body.md` or `/tmp/pr-body.md`, so that newlines and special characters are preserved.
2. Run:

```bash
gh pr create --base <BASE_BRANCH> --title "<TITLE>" --body-file <PATH_TO_BODY_FILE> --label "<PRIMARY_LABEL>" [--label "<FLOW_LABEL>" if applicable]
```

- Use the same `<BASE_BRANCH>` as in Step 1 (e.g. `develop` or `main`).
- Use the exact title and body file path from Step 4.
- Pass the **primary label** from Step 5. If the user chose a flow label (`stg fix` or `hot fix`), add a second `--label` for it.

Example (primary: data, no flow label):

```bash
gh pr create --base develop --title "fix(EmployeeLifecycle): [SQGZ-642] disable dependency toggle when no previous actions" --body-file .cursor/.pr-body.md --label "data"
```

Example (primary: ops, bugfix):

```bash
gh pr create --base develop --title "fix(goals): [SQ-123] handle validation error" --body-file .cursor/.pr-body.md --label "ops" --label "stg fix"
```

3. If `gh pr create` fails (e.g. not authenticated, or no upstream), report the error to the user and optionally output the title and body so they can create the PR manually.
4. If the PR is created successfully, output the PR URL. The labels are already set from Step 5.

---

## Rules

- Always run the git commands (Steps 1–3) before generating title/body or creating the PR.
- **Always ask for the primary label (Step 5) before running `gh pr create`.** Do not create the PR without at least one label.
- Never make up file changes — summarize only what the diff and commit log show.
- Keep the Summary factual and concise; use bullet lists and **bold** for key names.
- If multiple modules are affected, use the most impacted one as the scope, or `tech` for broad changes.
- The body file must contain valid markdown; avoid breaking the body with unescaped characters when writing the file.
