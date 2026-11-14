# #418 — Audited additive Dialog / Popover CLR contract after #494

**Scope:** only isolated #418 PR #500; stable Dev / 2.x NuGet unaffected. #494 inventory baseline merged into bluent-v3 via PR #506 (commit 4f25beff). Merge of that baseline into #418 (2e4579aa) exposed genuine additive API drift in the new CLR CI. The contract failure was NOT suppressed.

## Independently reviewed exact additions

Fresh Release-compiled temporary metadata compared against the original #494 snapshot showed **exactly 9 added public properties and 2 added public Dialog methods**:

| Type | New public member | CLR role |
| --- | --- | --- |
| Dialog | AccessibleName | string? Parameter |
| Dialog | AccessibleDescription | string? Parameter |
| Dialog | CloseButtonLabel | string? Parameter |
| Dialog | IsModal | bool Parameter |
| Dialog | EnableModalKeyboard | bool Parameter |
| Dialog | InitialFocusTargetId | string? Parameter |
| Dialog | UseStandardTitleHeading | bool Parameter |
| Popover | AccessibleTriggerState | bool Parameter |
| Popover | ThemeScope | PortalThemeScope CascadingParameter |

Dialog also adds public void DismissOnEscape() (JSInvokable) and overrides public ValueTask DisposeAsync(). The new Boolean flags default false; nullable text/scope parameters have no non-null initializer, keeping these branch-specific behaviors opt-in.

**Strict pre-acceptance diff:** all 140 type identities, 8 shared Bluent bases, prior property/method signatures, constructor/event lists, inheritance and abstract flags were unchanged. **Zero deletions, zero changed prior members, exactly 11 additions**. Only after verifying all those properties was the generated temporary CLR contract accepted into #418's snapshot and its temporary file removed. Post-review CLR signature checking returned PASS.

Current #418 snapshot: **140 component-related types, 8 shared public bases, 788 declared component properties, 23 shared-base properties, 196 declared public methods, 139 constructors, 13 CLR events**. Historical #494 baseline: 779 declared properties and 194 methods. Independent regression script scripts/quality/test_v3_issue418_additive_api_ledger.py protects the exact new members. The original #494 signature-drift negative tests remain active.

**Approval boundary:** This is branch-local tracking of previously implemented opt-in experiments, NOT acceptance of public v3 Dialog/Popover API design, native OS/AT, full runtime/UI parity or stable Dev/NuGet publication. Future CLR snapshot drift must still fail and be reviewed. #418 remains In progress.
