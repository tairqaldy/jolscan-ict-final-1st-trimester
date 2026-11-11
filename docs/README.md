# Documentation map

Every document has an owner who keeps it true, and a moment when it gets updated. If you change something a document describes, update the document **in the same pull request** (the pull request template asks).

## Where to write what you did

| You just… | Write it in |
|---|---|
| finished a task, or stopped for the day | your worklog: [`docs/worklog/<you>.md`](worklog/README.md) |
| chose between real options (dataset, metric, threshold, contract, workflow) | a decision record: [`docs/decisions/`](decisions/README.md) |
| used an AI tool for anything you hand in | [`AI-USAGE-LOG.md`](AI-USAGE-LOG.md) (required by the syllabus, AI level 3) |
| finished the whole lane | your row in [`CONTRIBUTION-LOG.md`](CONTRIBUTION-LOG.md); `python3 scripts/contribution_report.py` drafts it for you |
| changed a result, a rule or a contract | the lane document in the table below |

## Documents

| Document | Answers | Owner | Updated when |
|---|---|---|---|
| [PLAN.md](PLAN.md) | What is graded, scope, lanes, timeline, risks | Tair | a scope or date changes |
| [TASKS.md](TASKS.md) | Every task, claims, links to issues | everyone (claims), Tair (structure) | you claim or finish a task |
| [ARCHITECTURE.md](ARCHITECTURE.md) | How the parts connect, the JSON contracts, why | Tair, Alizhan | a contract or a component changes |
| [ML-EXPERIMENT.md](ML-EXPERIMENT.md) | Pothole data, runs, metrics, selection rule, results | Amina | after every pothole run batch |
| [ML-EXPERIMENT-RESTROOM.md](ML-EXPERIMENT-RESTROOM.md) | Restroom data, runs, pipeline, results | Nazar | after every restroom run |
| [RULES.md](RULES.md) | Both rule sets, thresholds and the evidence for them | Amina (part 1), Nazar (part 2) | a threshold changes |
| [DESIGN-BRIEF.md](DESIGN-BRIEF.md) | Pages, usability requirements, design direction, checks | Dameli, Tair | the direction or a page changes |
| [PRESENTATION.md](PRESENTATION.md) | Slides, timings, demo script, study cards | Roma | the deck changes |
| [COURSE-GROUNDING.md](COURSE-GROUNDING.md) | Which lecture backs which decision | Roma (checks), everyone (adds) | you cite a lecture |
| [AI-USAGE-LOG.md](AI-USAGE-LOG.md) | Prompt log, required by the syllabus | everyone | you use an AI tool |
| [CONTRIBUTION-LOG.md](CONTRIBUTION-LOG.md) | Who did what, for the individual questions | everyone | at the end of your lane, by the code freeze |
| [worklog/](worklog/README.md) | Each person's running record | everyone | after each task |
| [decisions/](decisions/README.md) | Why each important choice was made | whoever made it | when you choose |
| [research/](research/) | Course digests, datasets considered, audits | Roma | new research |
| [../data/README.md](../data/README.md) | Dataset cards, quality checks, privacy screening | Amina, Nazar | data changes |
| [../CONTRIBUTING.md](../CONTRIBUTING.md) | How we work: claim, rebase, merge | Tair | the workflow changes |

## At the end

By the code freeze, `python3 scripts/contribution_report.py` writes `docs/CONTRIBUTION-REPORT.md` from git, the merged pull requests, the closed task issues and the worklogs. Each person checks their section and finalises their row in `CONTRIBUTION-LOG.md`.

- [HANDOFF-DAMELI.md](HANDOFF-DAMELI.md): current state on 11 November, design priorities, how to work and merge, and a start prompt for a Claude session.
