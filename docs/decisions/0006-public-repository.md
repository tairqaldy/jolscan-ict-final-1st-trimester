# 0006. The repository is public

- **Date:** 2026-11-10
- **Decided by:** Tair and the team
- **Task / issue:** X-18
- **Status:** decided; its automatic deploys are turned off by [0010](0010-deploy-on-go-ahead.md)

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
- The course digests paraphrased university lecture material page by page. **Decided (X-18, Tair, 11 November 2026):** they are removed from the repository and kept in the team's shared Drive (`course-digests/`); `docs/COURSE-GROUNDING.md` keeps only the page references the project uses. Their earlier versions stay in the git history, which is not rewritten.
- **Commit emails (X-18, 11 November 2026):** the history shows the personal or university email addresses of five teammates' commits. The history is not rewritten, because that would break every open branch the day before the defense. Each teammate switches new commits to the GitHub no-reply address (GitHub, Settings → Emails: keep my email private, block command-line pushes that expose it; then `git config --global user.email <id>+<login>@users.noreply.github.com`). `scripts/people.json` holds no email addresses (PR #273).
- **Personal data in files (X-18, 11 November 2026):** a search of all tracked files found no personal email address or phone number. The public sample images are drawings and IOAI restroom signs, with no people.
- **Secrets (X-18, 11 November 2026):** a search of the full history (196 commits) for GitHub, AWS, OpenAI, Hugging Face, Slack, Google and Roboflow key formats and private keys found none. GitHub secret scanning is **not** enabled on the repository yet; Tair enables it under Settings → Advanced Security (secret protection and push protection). Secrets must never be committed; a leaked one is revoked at its source.
- Decision 0005 becomes a fallback only.
