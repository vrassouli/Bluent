# #418 — Opt-in Dialog/Popover theme ownership prototype

**2026-10-11 · Draft implementation, NOT an approved public v3 API.** PR #500 targets `bluent-v3`; stable `Dev` and released NuGet are unchanged.

## Design-first reference

Editable Penpot **Bluent v3 Design System**: file `b64f6665-c9ab-80b5-8008-c4ac99d9d000`, page `acf5f619-7d81-80da-8008-c5fec09d9837`, board `acf5f619-7d81-80da-8008-c5fec0b7ec61`. The 28-shape native board now distinguishes **the original verified detached Light portal defect** from the new opt-in proof-of-concept. PNG exported and visually inspected. The final contract still requires sign-off and coordination with #420.

## Experimental C# surface

`PortalThemeScope` is an immutable value-equality record: validated `Mode` (`light`/`dark`), `Direction` (`ltr`/`rtl`), `Density` (`comfortable`/`compact`), and `UseV3Tokens`. It now accepts an optional validated Brand. The opt-in research stylesheet overrides the 49 brand-changing source variables within each host, enabling concurrent different brands. See BRAND-SCOPES-PREVIEW.md.

**Popover:** provide the nearest Blazor `CascadingValue<PortalThemeScope>` from the actual owner; when that host changes, the existing registered Popover updates only its own detached service surface.

```razor
<CascadingValue Value="ThemeScope">
    <Popover KeepSurface="true" Placement="Placement.Bottom">
        <Trigger><Button Text="Open popover" /></Trigger>
        <Surface><p>Owner-scoped content</p></Surface>
    </Popover>
</CascadingValue>

@code {
    private PortalThemeScope ThemeScope => new("dark", "rtl", "compact");
}
```

**Dialog:** pass the calling owner's explicit snapshot at `ShowAsync`; a global service cannot infer it from a last click or document focus. Existing `DialogConfigurator.SetThemeScope` and nullable `DialogConfiguration.ThemeScope` opt in. All existing calls remain unchanged.

```csharp
var snapshot = new PortalThemeScope("dark", "rtl");
_ = dialogService.ShowAsync<MyDialogContent>(
    "Scoped dialog", null, options => options.SetThemeScope(snapshot));
```

`ShowMessageBoxAsync` does **not** automatically receive a scope in this prototype. Use a configurable `ShowAsync` overload if an owner-specific theme is required. Dialog captures immutable show-time data; Popover follows the owning CascadingValue. No v3 scope means the previous v2 rendering markup with no new mode/direction/token attributes.

## CSS/motion boundary

`scripts/quality/sync_v3_token_demo_asset.py` combines `issue-418-opt-in.preview.css`, `issue-418-accessibility.preview.css` and `issue-418-portal.preview.css` into a **Demo.Pages-only** static asset. The last source disables Dialog animations and Popover transitions on *individually opted-in portals* under reduced-motion. Stable component CSS, NuGet and `Dev` have **not** changed.

## Observed reproducible results on Dev01

Run `dotnet build Bluent.sln --configuration Release --no-restore`, `dotnet test Bluent.sln --configuration Release --no-build`, `dotnet build src/Bluent.UI.Demo/Bluent.UI.Demo.csproj --configuration Debug --no-restore`, and `node scripts/quality/probe_v3_blazor_runtime.mjs`. Published SSR assets: `pwsh -NoProfile -File scripts/quality/probe_v3_ssr_publish.ps1 -Port 5108`.

**Previous 83/83 browser checks, now expanded to 126/126 with concurrent brands:** 20 actual brand/Light-Dark Button colors, 20 primary opaque foreground/background numeric contrasts (minimum **5.552:1**, not general WCAG compliance), 20 root-token isolation checks and 22 runtime checks. The latter cover mode/RTL/density/keyboard, two concurrent opposite-mode Dialogs, nested independent Popovers, live Popover theme change, unscoped legacy Dialog, motion `0s` and actual close/removal of a scoped Dialog, and forced-colors role propagation without leakage. Six new NUnit cases bring the suite to **40/40**.

## Remaining acceptance

- The name and API remain provisional; brand-specific simultaneous independent hosts, owner lifecycle and final D2/#420 integration require review. This tests two mode scopes under one brand stylesheet, **not** different brands at once.
- Real High Contrast OS/assistive technology, screen readers, full keyboard focus trap/restoration, interactive SSR, additional browsers, Persian font fallback, zoom/reflow, all component states, design sign-off and component documentation remain open.
- Do not merge into `Dev`, publish stable NuGet, or mark #418 Done. To revert consumer use, omit the scope and research CSS; the old rendering path is intact.

**Additional reflow smoke:** Chrome emulates a 320px viewport with 200% root font size (32px) while the main host is RTL and contains an independent nested theme owner. Neither host overflows horizontally. This is one browser reflow sample, not complete WCAG zoom certification.

## Latest multi-brand checkpoint
See BRAND-SCOPES-PREVIEW.md for Penpot page 34 and 126/126 Chrome checks with Excel/Light and Word/Dark simultaneously, two branded portals, 49 source-varying custom properties, and 40/40 NUnit tests. This remains a research-only opt-in API and stylesheet.

## Actual Interactive Server parity
A second local Chrome execution (Production-published SSR + InteractiveServer, no remote deploy) now passes the same **126/126** Blazor interactions as WASM. See INTERACTIVE-SERVER-PROBE.md. This adds interaction evidence for the scoped Dialog/Popover services, but does not certify every pre-rendered SSR page, native accessibility or RenderMode.Auto.


## Additive draft Dialog AX/focus entry (2026-10-11)
See [D5 accessible Dialog prototype](D5-ACCESSIBLE-DIALOG-PROTOTYPE.md). Configurator.SetAccessibleDialog(name, localizedCloseLabel) opts a Dialog into role=dialog, a readable accessible name and Close Button, and native Blazor focus entry. No-config v2 markup stays unchanged. Chrome and Edge on WASM and published InteractiveServer each pass 149/149 assertions; NUnit 43/43. Focus return, modal trapping, Popover expanded state, native AT and final API review remain open.


## D5 ARIA and launcher return experiment
See [the opt-in keyboard/ARIA continuation](D5-FOCUS-RESTORE-POPOVER-ARIA-PROTOTYPE.md). The existing Dialog first-render focus and icon accessible name are extended by explicit caller-ID focus restoration after the final dialog closes. Popover visibility remains owned by its existing JavaScript implementation, which emits aria-expanded/aria-controls only when opted in and has a bounded no-transition dismissal fallback. All four real Chrome/Edge and WASM/InteractiveServer suites pass 157/157; NUnit 47/47. Full nested modal/AT remains pending.
