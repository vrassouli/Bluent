# Component Lab platform and per-family acceptance — #421

**Current state (2026-11-02): platform implementation merged; maintainer design review and the 66-family acceptance ledger remain open.** This page is the human-readable companion to `COMPONENT-LAB-COVERAGE.json`.

## What is integrated

The shared Component Lab implementation from [PR #551](https://github.com/vrassouli/Bluent/pull/551) is merged into `bluent-v3` as `8c9f2bd1c02fded8a2ecf8b9375a59531e4c8ccc`. Its final validated task head was `a6156adbf45f5a9d9679d2929b2026b37ff4efa3`; the recorded exact-head checks all passed, including the four real browser/render-mode cells:

| Browser | WebAssembly | Published InteractiveServer |
| --- | --- | --- |
| Chrome | Pass | Pass |
| Edge | Pass | Pass |

The integrated Lab provides the shared family navigation, 18 representative existing-API pilot specimens, source-linked examples and copyable Razor, and the browser test path. The canonical queue contains 66 source-candidate families; 16 currently have a real browser specimen. The queue is not an API inventory by itself and the 18 pilot specimens are not 18 finished Fluent v3 components.

## What is not accepted by the platform merge

The family ledger remains **18 representative pilots / 66 source families / 0 fully accepted component families**. Every family issue still owns its own full API and state inventory, Fluent mapping, approved editable design, complete interactive demo, keyboard and accessibility evidence, theme/RTL/responsive checks, docs, Skill, migration and reviewer acceptance. The Lab's shared browser matrix does not substitute for those gates.

Two known pilot boundaries stay explicit: [Slider #442](https://github.com/vrassouli/Bluent/issues/442) and [RangeSlider #443](https://github.com/vrassouli/Bluent/issues/443) have InteractiveServer pointer-binding gaps; their shared rendering smoke must not be described as successful Server pointer interaction.

## Design review boundary

The source-owned artifact is in the `Bluent v3 Design System` Penpot file (`b64f6665-c9ab-80b5-8008-c4ac99d9d000`), page 42 (`e775e67c-d9da-804b-8008-cc7c2dd7ecf7`), board `fce13529-02e2-80e4-8008-de96e1fdaca3` (**Lab platform vs component DoD · REVIEW REQUIRED**). The board and coverage ledger continue to record design approval as **pending**. This document does not claim a maintainer design sign-off; code, build and browser evidence are not substitutes for review of the editable design artifact.

## Workflow consequence

The Lab platform is sufficiently integrated to support a component's own work without waiting for all 66 families to be completed. It does **not** automatically promote any component issue, including Icon #429, from its current GitHub Project #5 status. A component may begin only after its own prerequisites and its actual Backlog → Ready → In progress gates are satisfied. The existing parity-debt-first direction for the 18 pilots remains in force; this update does not add a 19th pilot or weaken that decision.
