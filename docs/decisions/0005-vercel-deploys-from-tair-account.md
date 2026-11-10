# 0005. Production deploys are created from Tair's Vercel account

- **Date:** 2026-11-10
- **Decided by:** Tair
- **Task / issue:** W-24
- **Status:** decided

## Context
On the Vercel Hobby plan with a private repository, Vercel blocks every Git deployment whose commit author is not the account owner, so teammates' merges did not deploy and their pull requests show a red "Vercel" check.

## Options
1. Vercel Pro and add teammates.
2. Make the repository public.
3. Keep Git deploys for Tair's commits, and after other merges create the production deployment from Tair's account through the Vercel API.

## Decision
Option 3. The red "Vercel" check on a teammate's pull request is the plan restriction, not a code failure; judge pull requests by **web**, **python** and **up-to-date**.

## Why
No cost, the repository stays private (syllabus data-security rule), and a deployment created by the account owner builds any commit.

## Consequences
Someone with Tair's Vercel access triggers a production deploy after merges (the PR-merge routine does it). Preview deployments of teammates' branches are not automatic.
