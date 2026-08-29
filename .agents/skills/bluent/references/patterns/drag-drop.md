# Drag/drop and hierarchy pattern

Use `Tree` for hierarchical UI and `Bluent.UI.Utilities` hierarchy APIs only after checking the exact current source/demo. The canonical inventory explicitly identifies Tree/DnD as high-risk interaction requiring runtime evidence.

Do not assume drag/drop exists merely because a hierarchy component exists. Verify supported events, payloads, nesting, selection interaction, disabled states and render-mode behavior before generating consumer code.

Until a source/runtime-verified Tree reference is added, treat DnD details as unresolved and report the gap rather than inventing an API.
