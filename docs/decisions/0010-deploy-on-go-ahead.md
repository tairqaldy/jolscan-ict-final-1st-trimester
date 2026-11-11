# 0010. Production deploys only on Tair's go-ahead

- **Date:** 2026-11-11
- **Decided by:** Tair
- **Task / issue:** none (lead decision before the code freeze)
- **Status:** decided

## Context
Since [0006](0006-public-repository.md) every push deployed on its own: each push to `main`, one-line claim commits included, built production, and each push to a pull-request branch built a preview. On 11 November that was about 40 builds in 80 minutes, the night before the defense, on a Hobby plan with a daily deployment limit.

## Options
1. Keep automatic deploys and batch claim commits. Previews still build on every branch push.
2. Skip builds that do not touch `web/` (Vercel's Ignored Build Step). Every web merge and every preview still builds.
3. Turn off Git deployments and deploy `main` when Tair asks for it.

## Decision
Option 3: `web/vercel.json` sets `git.deploymentEnabled` to `false`, so pushes and merges no longer deploy.

## Why
The live site is the defense backup, so it should change only after someone has checked `main`, and the team stays far below the daily limit.

## Consequences
- Merging no longer updates https://qarau.vercel.app, and pull requests no longer get a preview link or a Vercel check. Pull requests are judged by **web**, **python** and **up-to-date**, as before.
- Check your change locally (`pnpm dev` in `web/`) before you merge.
- A deploy of `main` is created from Tair's Vercel account when he asks (the API route from [0005](0005-vercel-deploys-from-tair-account.md), or Redeploy in the Vercel dashboard).
- To turn automatic deploys back on, delete `web/vercel.json`.
