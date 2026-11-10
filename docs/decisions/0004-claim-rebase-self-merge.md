# 0004. Team workflow: claim, rebase before merging, merge yourself

- **Date:** 2026-11-10
- **Decided by:** Tair
- **Task / issue:** issue #11
- **Status:** decided

## Context
Six people push to one repository in two days. GitHub Free cannot enforce branch protection on a private repository.

## Options
1. One person reviews and merges everything.
2. Everyone merges their own pull requests under shared rules, with CI as the guard.

## Decision
Option 2: claim the task with a commit to `main` in `docs/TASKS.md` (and assign yourself to its issue), work on a branch, rebase on `main` right before merging, merge only when the checks are green. Merge commits are switched off.

## Why
No single bottleneck; the claim makes work visible; rebasing keeps anyone's work from being overwritten; the `up-to-date` CI job turns a pull request red when its branch is behind `main`.

## Consequences
"Never merge a red pull request" is a rule, not an enforced setting. See CONTRIBUTING.md.
