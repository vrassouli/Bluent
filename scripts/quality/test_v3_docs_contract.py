#!/usr/bin/env python3
"""#422: negative controls for v3 inventory drift guards."""
import unittest
import check_v3_docs_contract as docs


class V3DocsContractTests(unittest.TestCase):
    def setUp(self):
        self.lines = docs.INVENTORY.read_text(encoding="utf-8").splitlines()

    def test_actual_inventory_and_docs(self):
        self.assertEqual(docs.validate_inventory(), [])
        self.assertEqual(docs.validate_canonical_docs(), [])

    def test_stale_package_summary_detected(self):
        changed = [x.replace("| `Bluent.UI` | 58 | 58 | 1 |", "| `Bluent.UI` | 57 | 57 | 1 |") for x in self.lines]
        self.assertTrue(any("Bluent.UI: summary" in x for x in docs.validate_inventory(changed)))

    def test_stale_total_detected(self):
        changed = [x.replace("**66** | **66**", "**65** | **65**") for x in self.lines]
        self.assertTrue(any("Total summary" in x for x in docs.validate_inventory(changed)))

    def test_extra_family_without_summary_detected(self):
        i = next(i for i, line in enumerate(self.lines) if line.startswith("| [Accordion]"))
        changed = self.lines[:i] + ["| [Sample](accordion.md) | `Bluent.UI` | `src/Bluent.UI/Components/AccordionComponent/` | Source verified | Verify | Source only |"] + self.lines[i:]
        failures = docs.validate_inventory(changed)
        self.assertTrue(any("baseline has" in x for x in failures), failures)
        self.assertTrue(any("summary" in x for x in failures), failures)

    def test_button_api_reference_covers_declared_and_inherited_parameters(self):
        self.assertEqual(docs.validate_button_api_docs(), [])

    def test_missing_button_parameter_is_detected(self):
        body = docs.BUTTON_DOC.read_text(encoding="utf-8")
        body = body.replace("| `Compact` |", "| `CompactDraft` |", 1)
        failures = docs.validate_button_api_docs(body)
        self.assertTrue(any("missing from docs" in item and "Compact" in item for item in failures), failures)
        self.assertTrue(any("not declared" in item and "CompactDraft" in item for item in failures), failures)

    def test_missing_inherited_parameter_is_detected(self):
        body = docs.BUTTON_DOC.read_text(encoding="utf-8")
        body = body.replace("| `TooltipContent` |", "| `TooltipContentDraft` |", 1)
        failures = docs.validate_button_api_docs(body)
        self.assertTrue(any("missing from docs" in item and "TooltipContent" in item for item in failures), failures)

    def test_docs_contract_workflow_runs_when_button_api_sources_change(self):
        workflow = (docs.ROOT / ".github/workflows/v3-docs-contract.yml").read_text(encoding="utf-8")
        for source in docs.BUTTON_API_SOURCES:
            relative = source.relative_to(docs.ROOT).as_posix()
            self.assertIn(f'      - "{relative}"', workflow, relative)
        self.assertIn('      - "src/Bluent.UI/Components/ButtonComponent/Button.razor"', workflow)
        self.assertIn('      - "docs/components/button.md"', workflow)
        self.assertIn('      - "src/Bluent.UI.Demo.Pages/Pages/Components/Buttons.razor"', workflow)
        self.assertIn('      - "scripts/quality/probe_v3_button_focus_runtime.mjs"', workflow)
        self.assertIn('      - "src/Bluent.UI.Demo.Interactive.Client/Shared/CompatibilityProbe.razor"', workflow)
        self.assertIn('      - "scripts/quality/probe_v3_button_toggle_interactive_server.mjs"', workflow)

    def test_button_decorative_icon_and_accessible_name_contract_stays_documented(self):
        component_doc = docs.BUTTON_DOC.read_text(encoding="utf-8").lower()
        slice_doc = (docs.ROOT / "docs/v3/quality/BUTTON-TOGGLE-ARIA-SLICE.md").read_text(encoding="utf-8").lower()
        self.assertIn('aria-hidden="true"', component_doc)
        self.assertIn("caller-provided attribute such as `aria-label`", component_doc)
        self.assertIn("open menu", component_doc)
        self.assertIn("#420", component_doc)
        self.assertIn("#429", component_doc)
        self.assertIn("105/105", slice_doc)
        self.assertIn("explicit stable name", slice_doc)
        self.assertIn("native windows contrast themes", slice_doc)


    def test_button_appearance_size_shape_matrix_stays_exhaustive(self):
        demo = (docs.ROOT / "src/Bluent.UI.Demo.Pages/Pages/Components/Buttons.razor").read_text(encoding="utf-8")
        probe = (docs.ROOT / "scripts/quality/probe_v3_button_focus_runtime.mjs").read_text(encoding="utf-8")
        self.assertIn("Enum.GetValues<ButtonAppearance>()", demo)
        self.assertIn("Enum.GetValues<ButtonSize>()", demo)
        self.assertIn("Enum.GetValues<ButtonShape>()", demo)
        self.assertIn('data-demo-button-variant="@($"{matrixAppearance}-{matrixSize}-{matrixShape}")"', demo)
        self.assertIn('buttonVariantAppearances = ["Default", "Primary", "Danger", "Outline", "Subtle", "Transparent"]', probe)
        self.assertIn('buttonVariantSizes = ["Small", "Medium", "Large"]', probe)
        self.assertIn('buttonVariantShapes = ["Rounded", "Circular", "Square"]', probe)
        self.assertIn('buttonVariantMatrix.count===54', probe)
        self.assertIn('matrixRows===18', probe)
        self.assertIn('data-demo-button-direction="icon-text"', demo)
        self.assertIn('inspectButtonTheme("light")', probe)
        self.assertIn('inspectButtonTheme("dark")', probe)
        self.assertIn('rtlIconText.iconAfterText', probe)
        self.assertIn('rtlNarrow.buttonCount===54', probe)
        self.assertIn('data-bui-theme', probe)
        self.assertIn('await sleep(350)', probe)
        self.assertIn('rootToken:getComputedStyle(root).getPropertyValue("--colorNeutralBackground1").trim()', probe)
        self.assertIn('rtlNarrow.direction==="rtl"', probe)
    def test_button_explicit_toggled_changed_callback_demo_and_probe(self):
        demo = (docs.ROOT / "src/Bluent.UI.Demo.Pages/Pages/Components/Buttons.razor").read_text(encoding="utf-8")
        probe = (docs.ROOT / "scripts/quality/probe_v3_button_focus_runtime.mjs").read_text(encoding="utf-8")
        self.assertIn('ToggledChanged="RecordExplicitToggleChanged"', demo)
        self.assertIn('data-demo-toggle-callback-status', demo)
        self.assertIn('button[data-demo-toggle-callback=', probe)
        self.assertIn('ToggledChanged calls: 1', probe)
        self.assertIn('ToggledChanged calls: 2', probe)
        self.assertIn('trusted pointer invokes explicit ToggledChanged exactly once', probe)
        self.assertIn('native Space invokes explicit ToggledChanged once more', probe)

    def test_button_persian_text_direction_demo_and_ax_probe(self):
        demo = (docs.ROOT / "src/Bluent.UI.Demo.Pages/Pages/Components/Buttons.razor").read_text(encoding="utf-8")
        probe = (docs.ROOT / "scripts/quality/probe_v3_button_focus_runtime.mjs").read_text(encoding="utf-8")
        self.assertIn('Text="ذخیره تغییرات"', demo)
        self.assertIn('data-demo-button-persian="ltr"', demo)
        self.assertIn('data-demo-button-persian="rtl"', demo)
        self.assertIn('buttonAxBySelector', probe)
        self.assertIn('persianLtrAx.name==="ذخیره تغییرات"', probe)
        self.assertIn('persianRtlAx.name==="ذخیره تغییرات"', probe)
        self.assertIn('labelDirection==="rtl"', probe)

    def test_button_persian_direction_is_verified_in_published_interactive_modes(self):
        fixture = (docs.ROOT / "src/Bluent.UI.Demo.Interactive.Client/Shared/CompatibilityProbe.razor").read_text(encoding="utf-8")
        probe = (docs.ROOT / "scripts/quality/probe_v3_button_toggle_interactive_server.mjs").read_text(encoding="utf-8")
        focus_probe = (docs.ROOT / "scripts/quality/probe_v3_button_focus_runtime.mjs").read_text(encoding="utf-8")
        workflow = (docs.ROOT / ".github/workflows/v3-docs-contract.yml").read_text(encoding="utf-8")
        self.assertIn('Text="ذخیره تغییرات"', fixture)
        self.assertIn('data-testid="localized-button-ltr"', fixture)
        self.assertIn('data-testid="localized-button-rtl"', fixture)
        self.assertIn('localizedDirectionExpression', probe)
        self.assertIn('item.textDirectionAttribute === "auto"', probe)
        self.assertIn('localizedLtrAx.name === "ذخیره تغییرات"', probe)
        self.assertIn('localizedRtlAx.name === "ذخیره تغییرات"', probe)
        self.assertIn('"src/Bluent.UI.Demo.Interactive.Client/Shared/CompatibilityProbe.razor"', workflow)
        self.assertIn('"scripts/quality/probe_v3_button_toggle_interactive_server.mjs"', workflow)

    def test_button_managed_dropdown_lifecycle_is_verified_in_published_renderers(self):
        fixture = (docs.ROOT / "src/Bluent.UI.Demo.Interactive.Client/Shared/CompatibilityProbe.razor").read_text(encoding="utf-8")
        probe = (docs.ROOT / "scripts/quality/probe_v3_button_toggle_interactive_server.mjs").read_text(encoding="utf-8")
        focus_probe = (docs.ROOT / "scripts/quality/probe_v3_button_focus_runtime.mjs").read_text(encoding="utf-8")
        workflow = (docs.ROOT / ".github/workflows/v3-docs-contract.yml").read_text(encoding="utf-8")
        self.assertIn('data-testid="button-managed-dropdown-trigger"', fixture)
        self.assertIn('data-testid="button-managed-dropdown-copy"', fixture)
        self.assertIn("RecordManagedDropdownSelection", fixture)
        self.assertIn("const managedDropdownExpression =", probe)
        self.assertIn("Escape closes the managed Button dropdown and restores trigger focus", probe)
        self.assertIn("activating Copy invokes the component callback once and closes the dropdown", probe)
        self.assertIn('"src/Bluent.UI.Demo.Interactive.Client/Shared/CompatibilityProbe.razor"', workflow)
        self.assertIn('"scripts/quality/probe_v3_button_toggle_interactive_server.mjs"', workflow)

    def test_button_menu_keyboard_and_aria_contract_stays_wired(self):
        menu_list = (docs.ROOT / "src/Bluent.UI/Components/MenuListComponent/MenuList.razor").read_text(encoding="utf-8")
        menu_list_cs = (docs.ROOT / "src/Bluent.UI/Components/MenuListComponent/MenuList.razor.cs").read_text(encoding="utf-8")
        menu_item = (docs.ROOT / "src/Bluent.UI/Components/MenuListComponent/MenuItem.razor").read_text(encoding="utf-8")
        menu_item_cs = (docs.ROOT / "src/Bluent.UI/Components/MenuListComponent/MenuItem.razor.cs").read_text(encoding="utf-8")
        button_cs = (docs.ROOT / "src/Bluent.UI/Components/ButtonComponent/Button.razor.cs").read_text(encoding="utf-8")
        popover_component = (docs.ROOT / "src/Bluent.UI/Components/PopoverComponent/Popover.razor.cs").read_text(encoding="utf-8")
        popover_container = (docs.ROOT / "src/Bluent.UI/Components/PopoverComponent/PopoverContainerBase.cs").read_text(encoding="utf-8")
        popover_interop = (docs.ROOT / "src/Bluent.UI/Interops/PopoverInterop.cs").read_text(encoding="utf-8")
        popover_service = (docs.ROOT / "src/Bluent.UI/Services/PopoverService.cs").read_text(encoding="utf-8")
        popover = (docs.ROOT / "src/Bluent.UI.Scripts/src/Popover/Popover.ts").read_text(encoding="utf-8")
        fixture = (docs.ROOT / "src/Bluent.UI.Demo.Interactive.Client/Shared/CompatibilityProbe.razor").read_text(encoding="utf-8")
        probe = (docs.ROOT / "scripts/quality/probe_v3_button_toggle_interactive_server.mjs").read_text(encoding="utf-8")
        focus_probe = (docs.ROOT / "scripts/quality/probe_v3_button_focus_runtime.mjs").read_text(encoding="utf-8")
        workflow = (docs.ROOT / ".github/workflows/v3-docs-contract.yml").read_text(encoding="utf-8")

        self.assertIn('role="menu"', menu_list)
        self.assertIn('aria-label', menu_list_cs)
        self.assertIn('role="menuitem"', menu_item)
        self.assertIn('"tabindex", "-1"', menu_item)
        self.assertIn('"aria-disabled", "true"', menu_item)
        self.assertIn('aria-haspopup="menu"', menu_item)
        self.assertIn('aria-expanded="false"', menu_item)
        self.assertIn('aria-controls=', menu_item)
        self.assertIn('await OnClick.InvokeAsync()', menu_item_cs)
        self.assertIn('HandleKeyDown', menu_item_cs)
        self.assertIn('_subMenuPopover?.Show()', menu_item_cs)
        self.assertIn("return Task.CompletedTask", menu_item_cs)
        self.assertIn("internal Task CloseAsync()", popover_component)
        self.assertIn("internal Task ShowAsync()", popover_component)
        self.assertIn("await ParentPopover.ShowAsync()", button_cs)
        self.assertIn("internal async Task ShowAsync(string triggerId)", popover_service)
        self.assertIn("await _interop.ShowSurfaceAsync", popover_container)
        self.assertIn("ShowSurfaceAsync(PopoverSettings", popover_interop)
        self.assertIn("return service.CloseAsync", popover_component)
        self.assertIn("internal async Task CloseAsync", popover_service)
        self.assertIn("await _interop.HideSurfaceAsync", popover_container)
        self.assertIn("HideSurfaceAsync(PopoverSettings", popover_interop)
        self.assertIn("activeItem.click()", popover)
        self.assertIn("this.hideSurface(menuSettings, true)", popover)
        self.assertIn('noCaretSnapshot.hasPopup==="menu"', focus_probe)
        self.assertIn('trigger.hasPopup === "menu"', focus_probe)
        self.assertIn('opened.popup?.hasPopup === "menu"', focus_probe)

        button_doc = (docs.ROOT / "docs/components/button.md").read_text(encoding="utf-8")
        toggle_slice = (docs.ROOT / "docs/v3/quality/BUTTON-TOGGLE-ARIA-SLICE.md").read_text(encoding="utf-8")
        menu_slice = (docs.ROOT / "docs/v3/quality/BUTTON-MENU-KEYBOARD-SLICE.md").read_text(encoding="utf-8")
        self.assertIn('aria-haspopup="menu"', button_doc)
        self.assertIn('role="menuitem"', button_doc)
        self.assertIn("184/184 assertions", button_doc)
        self.assertIn("211/211 assertions in Chrome and 211/211 in Edge** on 2026-10-28", button_doc)
        self.assertNotIn('does not generate aria-haspopup="menu" yet', button_doc)
        self.assertNotIn("complete menu-role/arrow-key interaction contract", button_doc)
        self.assertIn("Latest published Button-managed menu keyboard verification — 2026-10-28", button_doc)
        self.assertIn("Superseding menu semantics checkpoint — 2026-10-28", toggle_slice)
        self.assertIn("184/184 assertions", toggle_slice)
        self.assertIn("BUTTON-MENU-KEYBOARD-SLICE.md", toggle_slice)
        self.assertIn("184/184 assertions", menu_slice)

        migration = (docs.ROOT / "docs/v3/design/MIGRATION-IMPACT-LEDGER.md").read_text(encoding="utf-8")
        button_dropdown_migration = next(
            (line for line in migration.splitlines() if line.startswith("| M15 — Button dropdown popup semantics/lifecycle |")),
            "",
        )
        self.assertTrue(button_dropdown_migration, "Button dropdown migration-impact row must remain present")
        self.assertIn("184/184 assertions", button_dropdown_migration)
        self.assertIn("BUTTON-MENU-KEYBOARD-SLICE.md", button_dropdown_migration)
        self.assertNotIn("aria-haspopup=\"menu\" remains deferred", button_dropdown_migration)

        for key in ('ArrowDown', 'ArrowUp', 'Home', 'End', 'Escape', 'aria-disabled', 'typeahead'):
            self.assertIn(key, popover.lower() if key == 'typeahead' else popover, key)

        for selector in ('button-managed-dropdown-disabled', 'button-managed-dropdown-submenu', 'button-managed-dropdown-archive'):
            self.assertIn(f'data-testid="{selector}"', fixture, selector)

        for assertion in (
            "initial managed dropdown surface is fully rendered before ARIA checks",
            "ArrowDown on trigger opens menu and focuses its first enabled item",
            "ArrowDown skips aria-disabled menuitems",
            "Home focuses the first enabled menuitem",
            "End focuses the last enabled menuitem",
            "type-ahead finds the first item with a matching text prefix",
            "Enter activates a focused menuitem exactly once and closes the menu",
            "Space activates a focused menuitem exactly once and closes the menu",
            "ArrowRight opens submenu and focuses its first enabled menuitem",
            "ArrowLeft closes submenu and restores focus to its parent item",
            "Tab closes menu without trapping focus or restoring the trigger",
        ):
            self.assertIn(assertion, probe, assertion)

        for source in (
            "src/Bluent.UI/Components/MenuListComponent/MenuList.razor",
            "src/Bluent.UI/Components/MenuListComponent/MenuList.razor.cs",
            "src/Bluent.UI/Components/MenuListComponent/MenuItem.razor",
            "src/Bluent.UI/Components/MenuListComponent/MenuItem.razor.cs",
            "src/Bluent.UI/Components/PopoverComponent/Popover.razor.cs",
            "src/Bluent.UI/Components/PopoverComponent/PopoverContainerBase.cs",
            "src/Bluent.UI/Interops/PopoverInterop.cs",
            "src/Bluent.UI/Services/PopoverService.cs",
            "src/Bluent.UI.Scripts/src/Popover/Popover.ts",
        ):
            self.assertIn(f'      - "{source}"', workflow, source)
    def test_button_badge_rtl_geometry_probe_stays_exhaustive(self):
        probe = (docs.ROOT / "scripts/quality/probe_v3_button_focus_runtime.mjs").read_text(encoding="utf-8")
        self.assertIn('inspectBadgeDirection("ltr")', probe)
        self.assertIn('inspectBadgeDirection("rtl")', probe)
        self.assertIn('LTR Badge Start aligns to physical left and End to physical right', probe)
        self.assertIn('RTL Badge Start mirrors to physical right and End to physical left', probe)
        self.assertIn('horizontalError<1.5', probe)
        self.assertIn('verticalError<1.5', probe)

    def test_button_tooltip_placement_matrix_stays_exhaustive(self):
        demo = (docs.ROOT / "src/Bluent.UI.Demo.Pages/Pages/Components/Buttons.razor").read_text(encoding="utf-8")
        probe = (docs.ROOT / "scripts/quality/probe_v3_button_focus_runtime.mjs").read_text(encoding="utf-8")
        self.assertIn("Enum.GetValues<Placement>()", demo)
        self.assertIn('TooltipPlacement="@tooltipPlacement"', demo)
        self.assertIn('data-demo-tooltip-placement="@tooltipPlacement"', demo)
        placements = ("Top", "Bottom", "Left", "Right", "TopStart", "TopEnd", "RightStart", "RightEnd", "BottomStart", "BottomEnd", "LeftStart", "LeftEnd")
        for placement in placements:
            self.assertIn(f'"{placement}"', probe, placement)
        self.assertIn("tooltipPlacementNames.every", probe)
        self.assertIn("waitTooltipState(trigger.id, true)", probe)
        self.assertIn("waitTooltipState(trigger.id, false)", probe)
        self.assertIn("shown.classes.split", probe)


if __name__ == "__main__":
    unittest.main()
