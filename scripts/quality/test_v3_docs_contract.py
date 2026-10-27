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
