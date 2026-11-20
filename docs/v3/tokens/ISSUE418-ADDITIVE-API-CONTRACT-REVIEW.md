# #418 — Audited additive Dialog / Popover CLR contract after #494

**Scope:** only isolated #418 PR #500; stable Dev / 2.x NuGet unaffected. #494 inventory baseline merged into bluent-v3 via PR #506 (commit 4f25beff). Merge of that baseline into #418 (2e4579aa) exposed genuine additive API drift in the new CLR CI. The contract failure was NOT suppressed.

## Independently reviewed component additions

Fresh Release-compiled CLR metadata was compared between `origin/bluent-v3` (`f3c87255e7a9846e8e5c6f0a9f8ce78909f849a6`) and the #418 implementation head (`6c9dc96158a554cba88f54ba516f27ed24c15215`). The component-only delta is **9 added public component properties and 2 added public Dialog methods**:

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

**Component-only pre-acceptance diff:** the 140 existing component-related type identities, 8 shared Bluent bases, prior component property/method signatures, constructor/event lists, inheritance and abstract flags were unchanged. The **9 property + 2 Dialog-method** delta above describes component members only; it is not the full package API delta. The additional helper/configuration surface is inventoried separately below.

## Supporting/public infrastructure additions — included in the API delta

The component-only table above is not the complete public package delta. The same Release-compiled comparison also found additive public members on existing support types and one new exported value type:

| Type | Additive public API |
| --- | --- |
| `Bluent.UI.Components.PortalThemeScope` (new type) | Public sealed immutable record; constructor `(string mode, string direction = "ltr", string density = "comfortable", bool useV3Tokens = true, string? brand = null)`; get-only `Mode`, `Direction`, `Density`, `UseV3Tokens`, `Brand`. |
| `DialogConfigurator` | `SetThemeScope(PortalThemeScope?)`, `SetAccessibleDialog(string, string)`, `SetAccessibleDescription(string)`, `SetReturnFocusTargetId(string)`, `SetModalKeyboardNavigation(bool = true)`, `SetInitialFocusTargetId(string)`. |
| `DialogConfiguration` | Init-only `ThemeScope`, `AccessibleName`, `AccessibleDescription`, `CloseButtonLabel`, `ReturnFocusTargetId`, `EnableModalKeyboard`, `InitialFocusTargetId`. |
| `PopoverSettings` | `AccessibleTriggerState`. |

**Portal scope rationale:** the selected Option A keeps existing `IDialogService.ShowAsync` overloads and uses the existing `DialogConfigurator` path, but callers still need a public strongly typed value they can construct and supply to `SetThemeScope` or `CascadingValue`. `PortalThemeScope` is that one immutable value carrier. It does not expose `OwnerId`, a launcher component or a separate `DialogAccessibilityOptions` type. Its current name/shape is experimental and not approved for production.

**Complete comparison result:** one new exported support type plus additive members on five existing exported types (`Dialog`, `Popover`, `PopoverSettings`, `DialogConfigurator`, `DialogConfiguration`). The existing component-family inventory remains 140 types / 8 shared public bases; the value carrier is a new support type outside that component-family count. No existing public member signatures were removed or changed, and no existing `IDialogService` overload was added, removed or changed. The component-only counts remain 9 properties / 2 Dialog methods as listed above; they must not be presented as the full package delta. The expanded inventory is mirrored in `issue-418-token-schema.preview.json` → `reviewPolicy.publicApiDelta` and guarded by `scripts/quality/test_v3_issue418_additive_api_ledger.py`.

**Approval boundary:** this is branch-local tracking of opt-in experiments, NOT acceptance of the final public v3 Dialog/Popover/Portal API names, native OS/AT, full runtime/UI parity or stable Dev/NuGet publication. Future CLR snapshot drift must still fail and be reviewed. #418 remains In progress.
