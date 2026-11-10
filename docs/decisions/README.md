# Decision records

A decision record is a short note written when the team chooses between real options: what was decided, the alternatives, and why. They answer the defense question "why did you do it this way?" and keep the docs from contradicting each other later.

Write one when you pick a dataset, a model, a metric or a threshold, change a contract in `docs/ARCHITECTURE.md`, or change how the team works. Ten lines is enough. Copy [0000-template.md](0000-template.md) to `NNNN-short-title.md` with the next free number and add it to the table below in the same pull request.

| # | Decision | Date | Who decided |
|---|---|---|---|
| [0001](0001-two-modules.md) | One platform with two modules: potholes and restroom signs | 2026-11-10 | Tair, with the team's chat |
| [0002](0002-colab-export-dataset.md) | The Colab export `potholes_yolo_v1` is the frozen pothole dataset | 2026-11-10 | Tair, on Amina's D-3 report |
| [0003](0003-pairwise-signage-rules.md) | Signage rules compare the two doors instead of judging each sign | 2026-11-10 | Tair, from measurements on the IOAI training set |
| [0004](0004-claim-rebase-self-merge.md) | Team workflow: claim, rebase before merging, merge yourself | 2026-11-10 | Tair |
| [0005](0005-vercel-deploys-from-tair-account.md) | Production deploys are created from Tair's Vercel account (replaced by 0006) | 2026-11-10 | Tair |
| [0006](0006-public-repository.md) | The repository is public | 2026-11-10 | Tair and the team |
