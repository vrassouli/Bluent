# Bluent v3 — GitHub Issue Lifecycle

**Mandatory** for every issue under [Epic #416](https://github.com/vrassouli/Bluent/issues/416). The **Status field in [Bluent Project #5](https://github.com/users/vrassouli/projects/5)** is the authoritative issue workflow state (not labels, branch names, nor GitHub open/closed alone).

## Normal flow

```text
Backlog → Ready → In progress → Review → Done
```

Each step is **explicit**. Do not skip directly from Backlog to In progress/Done. Keep an item in its prior state until the next transition gate is met.

| Status | Meaning | Transition gate |
| --- | --- | --- |
| **Backlog** | Known scope, not yet approved for implementation | New open issues begin here, automatically via GitHub Project where configured; ensure every v3 issue appears in Project #5 |
| **Ready** | Approved and independently implementable | Acceptance criteria, priority/scope, known dependencies and required design/architecture are sufficiently clear; no outstanding approval questions or real blockers |
| **In progress** | Implementation/design/docs task actively underway | Must come from Ready; create `v3/issue-<number>-<slug>` task branch from `bluent-v3`, identify owner; record meaningful work |
| **Review** | Ready for acceptance | PR targeting **`bluent-v3`** open and reviewable, tests/CI and required component documentation, Penpot references, demo, Skills, migration coverage and known limitations attached (as applicable) |
| **Done** | Accepted and integrated | Review accepted, required checks/DoD satisfied, PR merged **into `bluent-v3` only**, Epic #416 checklist updated; then close issue and mark Done |

## Exceptional states

- **Analysis** — optional for questions that genuinely require analysis/maintainer decisions. **Never autonomously process, promote, or resolve an issue already in Analysis; only do so after a new explicit request from the maintainer.** Return to Backlog or Ready only with documented results/approval.
- **Blocked** — use only when a real technical/external dependency prevents progress. Include the blocker, evidence, owner/next action and the prior workflow stage. On resolution return to that prior stage (or re-check its gate); do not silently claim Done.
- If review requests changes, move **Review → In progress**, revise the task PR, then **In progress → Review** again.
- Superseded/duplicate/unplanned closure must record traceability, `not_planned` or equivalent reason, and not claim that an unfixed defect was completed.

## Role permissions / automation contract

- **Groomer:** inspect **Backlog** to clarify requirements and promote only truly actionable items to **Ready**. If an item needs decisions, stop or flag it; **do not auto-run Analysis**. Never write implementation commits or close completed tasks.
- **Implementation worker:** only pull issues already in **Ready**, then set **In progress** when actual work starts; target PRs to `bluent-v3`, set **Review** when evidence is ready, and set **Done** only after review and successful merge.
- **Maintainer:** resolves approval questions and explicitly authorizes any Analysis processing and exceptional transitions. Approval of a v3 task is **not** approval to merge into `Dev` or release stable packages.
- Automation must use the real **GitHub Projects v2 Status field** via GitHub API/CLI and verify the resulting field value; don't simulate it using labels or infer from issue closure.
- Each transition should be traceable through Project history, PR and issue comments. Do not claim a status change without verifying it.

## Branch/release guardrail

Everything including docs and agent Skills remains isolated under `bluent-v3` until final explicit approval. Follow [BRANCHING.md](BRANCHING.md). The existing `Dev` branch remains frozen by [Ruleset #24813649](https://github.com/vrassouli/Bluent/rules/24813649); `bluent-v3` is PR-protected by [Ruleset #24813657](https://github.com/vrassouli/Bluent/rules/24813657).

## Project initialization baseline

Verified on **2026-10-09**: existing Project #5 already exposes `Backlog`, `Ready`, `In progress`, `Review`, `Done`, `Blocked`, `Analysis`. Before work began on workflow issue #496, all **78** open v3 issues were present in Project #5 and classified `Backlog`; the older closed issues were already `Done`. New issues should be checked for automatic addition and `Backlog` assignment.
