# Issue #418 — Portal / Dialog / Popover public API source audit — 2026-11-25

> **Status: DRAFT · source-backed contract review only.** This audit reads the current #418 branch prototype. It proposes API wording and records concrete lifecycle/configuration gaps; it does not authorize runtime/API changes, public API approval, production styling, or release.

## 1. Existing source facts

### Portal ownership and scope

- PortalThemeScope is an immutable public record in Bluent.UI.Components.
- Its current constructor requires mode and defaults direction="ltr", density="comfortable", useV3Tokens=true, and brand=null.
- Accepted values are light|dark, ltr|rtl, comfortable|compact, and one of the ten current source brands. There is no system mode.
- Popover.ThemeScope is a cascading parameter. Popover.OnParametersSet refreshes only the detached surface if the immutable scope changes.
- Service Dialog uses the existing IDialogService.ShowAsync overloads. DialogConfigurator.SetThemeScope copies the immutable scope into DialogConfiguration; DialogService.ShowAsync constructs a new DialogContext at invocation time. This is the selected Option A snapshot boundary.

The public name and constructor shape are still experimental. A maintainer decision must approve the exact strings/defaults and whether the current strict enumerations are a durable compatibility promise.

### Popover surface and trigger

- The actual detached surface root is PopoverSurface.razor: a top-level div whose ID is {TriggerId}_surface.
- The content fragment is rendered inside this root. The root is the target that a trigger's aria-controls relationship must identify.
- Popover.AccessibleTriggerState is copied into PopoverSettings and the JS bridge uses it only for authoritative trigger aria-expanded and aria-controls updates on supported button triggers.
- PopoverSettings is also passed over the JS interop boundary for positioning, event and visibility behavior.
- Neither the detached root nor the generic Popover currently receives a semantic role or accessible name. No universal aria-haspopup is added; consumers may supply the correct value on their own trigger.

This is why a future D5 surface contract must be consumer-selected, and why semantic root properties should not be added to the JS-serialized PopoverSettings payload.

## 2. D4 — concrete Dialog API findings

The current prototype uses the selected existing DialogConfigurator builder route and retains the existing service overloads. The following details need to be resolved before freezing its public contract.

| Source finding | Current behavior | Required contract / disposition |
|---|---|---|
| Description without name | SetAccessibleDescription accepts a nonblank description, but DialogConfigurator.Configuration silently drops it unless AccessibleName is also set. | Fail closed: final configuration validation should reject description-without-name, or the builder must make the dependency explicit. Never silently discard a successfully configured option. |
| Return focus without name | SetReturnFocusTargetId accepts a launcher ID without an accessible name. DialogContainer.Dispose currently completes pending tasks only for contexts with AccessibleName or EnableModalKeyboard; a return-focus-only context is not included in that opt-in cleanup filter. | Either require an accessible name for this focus-managed path, or include ReturnFocusTargetId in route/container disposal completion and test the no-longer-existing launcher case. State the chosen lifecycle explicitly. |
| Close label coupled to name | SetAccessibleDialog(name, closeButtonLabel) requires both values, while SetCloseButton(false) can suppress the actual button. | Decide whether the label remains mandatory even when the button is hidden, or whether name and close-button label become separate builder decisions. Do not publish accidental coupling without documenting it. |
| JS callback visibility | Dialog.DismissOnEscape is public and JSInvokable; it is an implementation callback, not an intended consumer command. | Keep the callback callable by the JS bridge, but document it as interop-only and consider editor hiding/documentation exclusion. Include it in the CLR ledger while distinguishing it from consumer-authored usage. |
| Disposal override | Dialog.DisposeAsync overrides the inherited async component-disposal contract to release the keyboard module/reference. | Retain correct cleanup. Classify this as an override of inherited lifecycle behavior, not as a new Dialog capability; still preserve it in the compiled API/override audit. |

Additional facts:

- EnableModalKeyboard is valid only when Modal=true and AccessibleName is supplied.
- InitialFocusTargetId also requires an explicitly named Dialog.
- The service Dialog root emits role="dialog" only when named; aria-modal="true" is emitted only for the explicit modal keyboard opt-in. A named non-modal Dialog does not become modal.
- A standard title heading uses aria-labelledby; otherwise the supplied accessible name is emitted as aria-label.
- AccessibleDescription is emitted as aria-describedby only for a named Dialog.
- The existing v2/default service path remains modal by configuration but does not silently opt into the new focus/keyboard behavior.

## 3. D5 — recommended minimal additive Popover API candidate

**Candidate names only; not approved or implemented.**

| Candidate Popover parameter | Type | Default | Purpose |
|---|---|---|---|
| SurfaceRole | string? | null | Explicit semantic role forwarded to the actual detached surface root. |
| SurfaceAriaLabel | string? | null | Consumer-provided accessible name via aria-label. |
| SurfaceAriaLabelledBy | string? | null | Consumer-provided accessible-name references via aria-labelledby (one or more space-separated IDs). |

### Proposed behavioral constraints

1. All three values are opt-in. When absent, the surface remains the current role-less, unnamed div.
2. Forward them onto PopoverSurface's actual root, whose ID is the controlled target. Do not place them on a wrapper or on the trigger.
3. SurfaceAriaLabel and SurfaceAriaLabelledBy are mutually exclusive; a nonblank name source requires an explicit SurfaceRole that permits author-provided naming. Reject empty/whitespace-only values rather than rendering empty ARIA attributes.
4. SurfaceRole is a single canonical ARIA role token, not a list and not inferred from content. Final supported-role validation and the role's naming rules need to be listed in the approved contract.
5. Do not emit a default role, aria-label, aria-labelledby, aria-haspopup or aria-modal. The caller remains responsible for the correct trigger aria-haspopup value and the role-specific interaction model.
6. Keep surface semantics out of PopoverSettings because that record is used across JS interop for trigger/position/event behavior. Carry the three DOM-only values in the Blazor-side PopoverConfiguration and render them on PopoverSurface root.
7. Role forwarding alone does not implement menu/listbox/grid keyboard behavior, focus movement, dismissal, or modality. Each consumer must own and test its own interaction contract.

### Consumer examples (illustrative; not a shipped API)

- DateField #438: SurfaceRole="dialog" and SurfaceAriaLabelledBy="calendar-heading"; the calendar remains non-modal, with no aria-modal, focus trap or background inerting.
- Label Info: an explicit supplemental-content role/name chosen by the approved Label design; no assumption that it is a tooltip if the surface contains interactive content.
- Menu/listbox consumers: only select those roles when their matching keyboard/selection models are implemented and accepted; adding a role alone is insufficient.

### Required tests if approved

- Default generic Popover remains role-less/unnamed and does not emit aria-haspopup.
- Explicit role and either name source land on the exact detached root referenced by trigger aria-controls.
- Both name sources together, blank role/name values and name-without-role fail validation.
- aria-labelledby with multiple valid IDs resolves to the intended accessible name; missing IDs are surfaced by a browser-level accessibility-tree assertion.
- DateField dialog remains non-modal and Label Info keeps its own consumer-specific interaction/role.
- Chrome/Edge × InteractiveServer/WebAssembly plus Firefox/WebKit portal regression; native AT remains a separate gate.

## 4. Recommended decision sequence

1. Resolve D4's concrete validation/lifecycle questions and approve or revise exact PortalThemeScope and DialogConfigurator names/defaults.
2. Approve the D5 forwarding behavior and then the three candidate parameter names/types (or select alternatives).
3. Only after those decisions, implement the additive surface contract with a CLR baseline update reviewed as a deliberate API change.
4. Keep all Penpot page 54 material DRAFT / REVIEW REQUIRED until design parity is explicitly accepted. No change to #438 workflow status is implied.

Canonical current evidence: [Additive API ledger](ISSUE418-ADDITIVE-API-CONTRACT-REVIEW.md), [Portal/Dialog proposal](PORTAL-THEME-PUBLIC-API-PROPOSAL.md), and [DateField consumer review](DATEFIELD-POPOVER-CONSUMER-REVIEW.md).
