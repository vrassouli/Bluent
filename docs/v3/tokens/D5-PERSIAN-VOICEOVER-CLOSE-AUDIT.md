# #418 D5 — Persian-first Dialog, localized Close and native VoiceOver gate

**Checkpoint: 2026-10-12.** Draft v3-only research on `v3/issue-418-design-tokens`. Keep PR #500 Draft to `bluent-v3`; never merge to stable `Dev` or publish stable NuGet based on this checkpoint.

## Actual editable Penpot design-first evidence

Authoritative Bluent v3 Design System file `b64f6665-c9ab-80b5-8008-c4ac99d9d000`. Newly authored **D5 · VoiceOver Persian description and close QA · #418** page `6519bd63-6e0d-802b-8008-c6ddeb6733bd` and board `6519bd63-6e0d-802b-8008-c6ddeb872846`. **26 native editable shapes**, verified **zero elements out of bounds**, exported actual PNG and visually reviewed. It explicitly distinguishes browser DOM/AX tests from native VoiceOver spoken-caption and return-cursor validation. Board is DRAFT, not final fluent acceptance.

## Real Blazor opt-in fixture

A button `v3-show-persian-dialog` in the isolated V3 Styling Lab opens a **real service-hosted** Dialog whose initial heading is **«بررسی درخواست مرخصی»**, whose description is **«برای تأیید درخواست مرخصی شماره ABC-123، اطلاعات را بررسی کنید؛ سپس پنجره را ببندید.»**, and whose icon-only close action has explicit `aria-label="بستن پنجره"`. Its initial focus is the actual Bluent TextField `v3-live-title-field`; its explicitly scoped return-focus target is the launch Button. This uses already-existing draft opt-in D5 methods, **no new public component APIs and no stable CSS changes**. The original English dynamic-title VoiceOver fixture remains available.

## Actual executed browser regression evidence

Extended dependency-free `scripts/quality/probe_v3_blazor_runtime.mjs` with **four** real checks: (1) Persian heading/aria-labelledby IDREF and TextField focus, (2) visible unique Persian description/aria-describedby IDREF, (3) Chromium Accessibility Tree computed name and description exactly match the Persian strings, and (4) activating localized Persian Close actually dismisses and returns focus to the launcher.

| Actual browser | Real Blazor host | Outcome |
| --- | --- | --- |
| Google Chrome | WebAssembly | **198/198 PASS** |
| Microsoft Edge | WebAssembly | **198/198 PASS** |
| Chrome | locally published InteractiveServer | **201/201 PASS** |
| Edge | locally published InteractiveServer | **201/201 PASS** |

Release solution build: **0 warnings/errors**; NUnit **60/60 PASS**; published SSR static-asset smoke **4/4 PASS**. Note that the WASM probe uses Debug `--no-build`; it initially timed out because the newly added fixture had only been built in Release. Rebuilding the actual Debug demo resolved this test-harness stale-build issue; it was not a runtime Dialog defect.

## Safari and native VoiceOver gate: OPEN for this new scenario

MacBook3 initially went offline during this checkpoint, later reconnected. The exact task-branch code was fetched into a temporary detached Git worktree and locally published for Safari. However **SafariDriver rejected new WebDriver sessions**: Safari again reported that **Allow Remote Automation** must be enabled in Developer Settings. This user setting was **not modified** by the test. The extended Python W3C Safari smoke `scripts/quality/probe_v3_safari_webdriver.py` has **four new Persian-first checks and passes syntax compilation**, but those four checks have **NOT run in actual Safari**. The previously verified real Safari/WebKit **18/18** (before the new fixture) remains valid for the older D5 scenarios, not the new Persian Close fixture.

A native VoiceOver first-run follow-up was attempted via the Safari GUI, but did **not** yield a reproducible spoken-caption + close/cursor-return trace for this new scenario. **No new native VoiceOver PASS is claimed.** The earlier verified VoiceOver Caption Panel observation in `D5-VOICEOVER-OBSERVATIONS.md` still supports actual native Dialog role and changing Persian heading reading, but does not certify this Persian explanation or localized Close/focus-return flow.

Remaining: enable Safari's *Allow Remote Automation* to rerun the new **22-check** WebKit script; separately capture native VoiceOver caption-panel reading of the full Persian description and VoiceOver-activated localized Close + returned cursor; global persistent Dialog owner policy; final API/Fluent/Skills/migration/AT review.

**#418: In progress · PR #500: Draft · #420: Backlog**. No stable Dev merge, deployment or NuGet publish.
