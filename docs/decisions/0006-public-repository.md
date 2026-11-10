# 0006. The repository is public

- **Date:** 2026-11-10
- **Decided by:** Tair and the team
- **Task / issue:** X-18
- **Status:** decided

## Context
The repository started private. On the Vercel Hobby plan, a private repository only deploys commits authored by the account owner (decision 0005), and GitHub Free offers no branch rules for private repositories.

## Options
1. Stay private and deploy through Tair's account after every merge.
2. Pay for Vercel Pro and GitHub Pro.
3. Make the repository public.

## Decision
Option 3, on 10 November 2026 at about 16:09 UTC.

## Why
Every teammate's merge now deploys on its own, preview deployments work for every pull request, `main` can be protected against force pushes and deletion, and the work is visible for the defense and for portfolios.

## Consequences
- Everything in the repository and its history is readable by anyone, including commit author names and emails. The syllabus forbids personal data in public repositories (Syl p.9), so: no photos with people, faces or licence plates; no personal data in docs; teammates switch to GitHub no-reply emails for new commits (task X-18).
- The course digests in `docs/research/` paraphrase university lecture material; X-18 decides whether to keep them public or reduce them to the page references the project uses.
- Secrets must never be committed; GitHub secret scanning now runs on the repository.
- Decision 0005 becomes a fallback only.
