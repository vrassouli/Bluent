# Version-aware component lookup for Bluent v3

> **Not a v3 API reference and not released.** This is a routing contract; the existence of a component in the current inventory does not mean its v3 rewrite has been completed.

## Decision table

| Observed state | Evidence to consult | What can be said or generated |
| --- | --- | --- |
| Consumer uses a released 2.x NuGet | Installed package, [legacy consumer Skill](../bluent/SKILL.md), [existing inventory](../../../docs/components/inventory.md) | Only the version-matching existing API; `Dev` may be newer than the package |
| Family v3 issue is Backlog or Ready | [Epic #416](https://github.com/vrassouli/Bluent/issues/416), accepted foundation/design | No approved new v3 API. Review design/workflow, do not present a prototype as runnable consumer code |
| Family v3 issue is In progress | The task branch / draft PR / owned Penpot file | Source-backed work-in-progress; no public v3 or NuGet guarantee |
| Family v3 issue is Review | PR to `bluent-v3` and actual test evidence | Reviewable proposal; not released, not automatically Done |
| Family v3 issue is Done and accepted PR merged to `bluent-v3` | Merged source, canonical component page, demo, Skill, migration ledger | Document precisely what was accepted on `bluent-v3`; still not a stable v3 NuGet release |
| Family is Charts/Diagrams/Utilities or a Bluent extension | Inventory owner and appropriate v3 issue | Preserve extension behavior, do not fabricate a nonexistent Fluent equivalent |

## Source precedence

Use the exact package revision for consumers. For v3 implementation use: accepted architectural decision → owned Penpot design with file/page/variant IDs → real merged source/typed API → verified demo/test → documented migration. Treat draft token names, guessed imports and unmerged experimental CSS as tentative even if CI passed.

Current starting points: [canonical documentation entry](../../../docs/v3/README.md), [component reference template](../../../docs/v3/COMPONENT-REFERENCE-TEMPLATE.md), [design source](../../../docs/v3/design/BLUENT-V3-PENPOT.md), [issue workflow](../../../docs/v3/ISSUE-WORKFLOW.md).

**Button example:** #501 is a native Focus design review and #428 is the planned production Button rewrite. The existing [2.x Button reference](../../../docs/components/button.md) remains the consumer authority until a real accepted v3 implementation and version exist. Research-only Focus/Danger tests do not qualify as a v3 Button API.

**Icon example:** #429 is in **Review** with PR #558 open and Ready for independent implementation review, targeting `bluent-v3`. Its page-47 visual design direction is maintainer-approved (2026-11-04); the page and three board status labels are synchronized to `DESIGN APPROVED` (the asset-comparison board is explicitly scoped). Use the [v3 Icon implementation record](../../../docs/v3/components/icon.md) and [Icon review handoff Skill](../bluent-v3-icon/SKILL.md) for source-backed v3 work only. The existing [2.x Icon reference](../../../docs/components/icon.md) remains the consumer authority for released packages. Design approval and green CI do not constitute exhaustive glyph pixel parity, native OS contrast or native assistive-technology acceptance; no independent PR review has been recorded yet.


**Label example:** #430 is **In progress** on `v3/issue-430-label`, targeting `bluent-v3`. The three Label semantic text roles are maintainer-approved for this consumer; the broader #418 token foundation remains In progress. Use the [v3 Label implementation record](../../../docs/v3/components/label.md) and [Label task handoff Skill](../bluent-v3-label/SKILL.md) for this branch only. The existing [2.x Label reference](../../../docs/components/label.md) remains authoritative for released packages. Build/source contracts are not real browser/AT acceptance and do not imply a v3 release.

**Link example:** #431 is in progress on v3/issue-431-link, targeting bluent-v3. Use the [v3 Link reference](../../../docs/v3/components/link.md) and [Link task Skill](../bluent-v3-link/SKILL.md) for experimental behavior, disabled-navigation contract and tests. Penpot page 50 boards remain DRAFT; #418 owns token approval. The existing [2.x Link reference](../../../docs/components/link.md) remains authoritative for released packages. Do not claim Link is accepted or released until #431 passes review and merges into bluent-v3.