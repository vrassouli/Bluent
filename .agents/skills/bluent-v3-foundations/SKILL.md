# Bluent v3 foundation: focus indicator host-contrast QA

Use this skill while designing v3 Fluent 2 focus-visible tokens and controls under Epic #416 / #418. Read AGENTS.md and docs/v3/ISSUE-WORKFLOW.md first. **Never edit stable Dev/v2 or ship NuGet.** Penpot canonical design file: Bluent v3 Design System, page 07 Accessibility & RTL.

## Reviewed facts and non-waivable boundaries

- Maintainer prefers brand-colored single-ring keyboard focus on Button, not neutral Focus2 as default. TextField uses its own animated 2px bottom underline, **no extra rectangular ring**.
- Browser-specific v3 research ring: outline 2px, outline-offset 2px. Judge contrast primarily against the OUTER SURROUNDING HOST; measuring only against the Button's own Primary/Danger fill is misleading because the outline sits outside the face.
- Research source normal/hover neutral host candidate: Light colorBrandBackground, Dark colorBrandForeground2. This is not an approved published token rule.
- Crucial counterexample: the same brand-color ring is too similar to brand-filled / danger-filled PARENT HOSTS. Existing colorNeutralForegroundOnBrand contrasts well on those hosts but fails on Dark inverted white hosts. An unconditional switch to white or an unconditional colored ring is **not a universal solution**.
- Evidence: docs/v3/tokens/FOCUS-HOST-CONTEXT-REVIEW.md. Reproducible 100-case source audit: python scripts/quality/audit_v3_focus_host_surface_matrix.py; five contract tests: python -m unittest discover -s scripts/quality -p test_v3_focus_host_surface_matrix.py -v. Real-browser matrix: node scripts/quality/probe_v3_blazor_runtime.mjs on configured Dev01; observed 753/753 on Chrome WASM.
- Actual Penpot editable boards: filled host research 94a03b1b-8cb6-8091-8008-c96c96ea484f and inverse context 94a03b1b-8cb6-8091-8008-c96d09329a0b. Recheck geometry with scripts/quality/penpot_v3_focus_context_hosts_audit.js in a live connected Penpot plugin. Source-owned shape geometry: 3px symmetric vector ring around Button face with 2px stroke (CSS equivalent outline 2px + offset 2px).
- No public focus semantics, new component props, universal accessible styling, real Windows Contrast Themes, native browser zoom or assistive tech sign-off has been authorized by these local tests. Do not mark #418 Done without approved design/API and actual acceptance evidence.

**2026-10-14 connected Penpot acceptance evidence:** after an earlier suspended-tab attempt, the combined read-only editable-board test was actually run in the correct Bluent v3 Penpot file and PASSED **40/40**, zero failures. Design artifact integrity is proven for these six examples only; actual app/OS/AT/contrast contexts beyond the test inventory still need review.
