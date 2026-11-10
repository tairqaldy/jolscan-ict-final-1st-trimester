# Worklogs

One file per person. Write an entry **every time you finish a task or stop for the day**, in the same pull request as the work. Five minutes per entry is enough.

Why: at the defense every member answers an individual question about their own part, and the syllabus asks for a contribution log (Syl p.5). These files are the raw material for both. At the end, `python3 scripts/contribution_report.py` combines them with the git history and the pull requests into `docs/CONTRIBUTION-REPORT.md`, so nobody has to remember on Wednesday night what they did on Tuesday.

| Person | Worklog |
|---|---|
| Tair | [tair.md](tair.md) |
| Dameli | [dameli.md](dameli.md) |
| Nazar | [nazar.md](nazar.md) |
| Amina | [amina.md](amina.md) |
| Alizhan | [alizhan.md](alizhan.md) |
| Roma | [roma.md](roma.md) |

## Entry format

Copy this block to the **top** of the "Entries" section of your file (newest first):

```markdown
### 2026-11-10 21:30 · M-3 (#52) · Train the E0 baseline
- **Status:** done | in progress | blocked (say on what)
- **What I did:** two or three sentences, concrete.
- **Result:** the file, page, number or decision that came out of it, with a link (PR, commit, issue).
- **Decisions and why:** anything I chose between options, and the reason.
- **What I learned / can explain at the defense:** one or two sentences in my own words, with the course term if there is one.
- **AI use:** none | tool and what for (and add the entry to docs/AI-USAGE-LOG.md).
- **Open questions / next:** what is left, who needs to know.
```

Rules: write what you did, not what the task said; link the evidence; never paste tokens, passwords or personal data.
