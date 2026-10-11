# #418 D5 — Safari/WebKit and VoiceOver audit (2026-10-11)

**Status:** real Safari interaction verified; native VoiceOver spoken output **NOT verified**. This is a DRAFT opt-in v3 foundation, not final Fluent/API/WCAG approval. #418 stays In progress; PR #500 Draft targeting `bluent-v3` only.

## Actual editable design

Authoritative Penpot: **Bluent v3 Design System**, file `b64f6665-c9ab-80b5-8008-c4ac99d9d000`. New page **D5 · Dialog lifecycle and Safari VoiceOver QA · #418**, page ID `535db143-a732-807e-8008-c661af0787e1`, board `535db143-a732-807e-8008-c661af7e66a4`. **26 native editable shapes**, live Penpot geometry verified **0 boundary errors**, PNG exported and visually inspected. The board separates Blazor lifecycle, actual WebKit and real screen-reader speech as independent gates. **Draft**, not final signoff.

## True MacBook3 WebKit test

Mac original `/Users/vahid/projects/Bluent` stayed on **Dev**, including its unrelated existing `.idea` change. Created a disposable **Git worktree, not a clone**, at `/tmp/bluent-v3-safari-418` from the task branch (initially commit `21179168`), with .NET 10; `dotnet restore/build` succeeded without warnings/errors. Published `Bluent.UI.Demo.SSR` locally to `/tmp/bluent-v3-safari-418-published` and served `http://127.0.0.1:6143/v3/interactive-portal-lab`. The published host served real Blazor JS and CSS at HTTP 200.

A direct Debug run in the disposable worktree returned prerendered HTML but had invalid physical StaticAssetDevelopmentRuntimeHandler paths for `_framework/blazor.web.js` and component CSS; it could not hydrate. The **Release published host** fixed this infrastructure condition. W3C SafariDriver started a real session on **Safari 27.0.1 / WebKit**, status ready=true. A real theme toggle changed Blazor state, proving interactive hydration.

Added reusable stdlib W3C WebDriver script `scripts/quality/probe_v3_safari_webdriver.py`, called after `safaridriver -p 4444` and starting the published host:

```bash
python3 scripts/quality/probe_v3_safari_webdriver.py --base http://127.0.0.1:6143 --driver http://127.0.0.1:4444
```

**Real Safari/WebKit: 15/15 PASS.** Checks: real Blazor event roundtrip; named `role=dialog` and `aria-modal=true`; initial focus; WebDriver Tab/Shift+Tab focus containment; Escape and launcher focus return; actual visible `h2` IDREF; visible `aria-describedby`; real TextField initial focus; live Persian title change with same IDREF; escape after rename; **three cycles of real Blazor @if Dialog owner unmount**. This is an independent engine beyond Chrome/Edge (both Chromium). It does **not** imply VoiceOver spoken output.

The first scripted run timed out because launching VoiceOver Quickstart had also stopped the temporary Blazor host. Once that host was restarted and returned HTTP 200, the **same unchanged Safari script** passed 15/15. Do not classify that infrastructure timeout as a Safari Dialog regression.

## Native VoiceOver: not yet accepted

`open -a VoiceOver` opened the **VoiceOver Quickstart first-run app/window**, not a verifiable screen-reader speech/navigation session. The test could not capture spoken announcements, VoiceOver cursor behavior or output. The Quickstart process opened for this test was closed without changing OS preferences. A full native assistive-technology pass remains **OPEN**; finish the VoiceOver Quickstart interactively, then test the Persian Dialog name, description, close action, form field, Escape and focus return with observable announcements.

SafariDriver/browser test is green; **VoiceOver speech is not certified**. Neither stable Dev nor NuGet releases were modified. The separate #420 issue remains Backlog, and global service-hosted Dialog navigation semantics remain an open D2/D5 architecture decision.
