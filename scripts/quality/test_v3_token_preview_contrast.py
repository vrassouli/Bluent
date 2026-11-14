#!/usr/bin/env python3
"""Contract tests for the #418 source-backed token contrast report."""
from __future__ import annotations

import contextlib
import io
import json
from pathlib import Path
import unittest

from audit_v3_token_preview_contrast import main


class TokenPreviewContrastReportTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        output = io.StringIO()
        with contextlib.redirect_stdout(output):
            cls.exit_code = main()
        cls.report = json.loads(output.getvalue())

    def test_all_twenty_source_brand_mode_cases_are_counted(self) -> None:
        self.assertEqual(self.exit_code, 0)
        self.assertTrue(self.report["pass"])
        self.assertEqual(self.report["brandModePairs"], 20)
        self.assertEqual(self.report["coreContrastPairs"], 80)
        self.assertEqual(self.report["draftForegroundDiagnosticPairs"], 60)
        self.assertEqual(self.report["candidateRoleDiagnosticPairs"], 40)
        self.assertEqual(self.report["additionalCandidateRoleDiagnosticPairs"], 120)
        self.assertEqual(self.report["sourceDiagnosticChecks"], 300)
        self.assertEqual(self.report["darkBrandForegroundCandidatePairs"], 40)
        self.assertEqual(self.report["checks"], 360)
        self.assertEqual(self.report["placeholderContrastPairs"], 20)
        self.assertEqual(self.report["placeholderBelow4_5"], 0)

    def test_textfield_placeholder_uses_fluent_fg4_and_passes_filled_darker_bg3(self) -> None:
        root = Path(__file__).resolve().parents[2]
        schema = json.loads((root / "docs/v3/tokens/issue-418-token-schema.preview.json").read_text(encoding="utf-8"))
        matrix = json.loads((root / "docs/v3/tokens/issue-418-brand-matrix.preview.json").read_text(encoding="utf-8"))
        css = (root / "docs/v3/tokens/issue-418-opt-in.preview.css").read_text(encoding="utf-8")
        source = {item["name"]: item for item in schema["layers"]["source"]}
        semantic = {item["name"]: item for item in schema["layers"]["semantic"]}
        self.assertEqual(source["bluent.color.foreground4"]["css"], "--colorNeutralForeground4")
        self.assertEqual(source["bluent.color.foreground4"]["default"], {"light": "#707070", "dark": "#999999"})
        self.assertEqual(semantic["bluent.semantic.text.placeholder"]["alias"], "bluent.color.foreground4")
        self.assertEqual(semantic["bluent.semantic.text.placeholder"]["css"], "--bui-v3-text-placeholder")
        self.assertIn("--bui-v3-text-placeholder: var(--colorNeutralForeground4);", css)

        self.assertEqual(self.report["placeholderMapping"]["source"], "--colorNeutralForeground4")
        self.assertEqual(self.report["placeholderMapping"]["semantic"], "bluent.semantic.text.placeholder")
        self.assertEqual(self.report["placeholderMapping"]["disabledSource"], "--colorNeutralForegroundDisabled")
        self.assertEqual(self.report["placeholderMinimumByMode"], {"light": 4.5423, "dark": 6.4663})
        self.assertEqual(self.report["placeholderMinimum"], 4.5423)
        self.assertEqual(self.report["placeholderBelow4_5"], 0)

        for brand, modes in matrix["brands"].items():
            for mode, entry in modes.items():
                with self.subTest(brand=brand, mode=mode):
                    tokens = entry["tokens"]
                    self.assertEqual(tokens["bluent.semantic.text.placeholder"], tokens["bluent.color.foreground4"])
                    self.assertEqual(tokens["bluent.color.foreground4"], "#707070" if mode == "light" else "#999999")

    def test_dark_action_and_link_foreground_gap_is_explicit(self) -> None:
        self.assertEqual(self.report["actionForegroundBelow4_5"], 10)
        self.assertEqual(self.report["brandLinkForegroundBelow4_5"], 10)
        self.assertEqual(self.report["minimum"]["actionForeground"]["ratio"], 3.551)
        self.assertEqual(self.report["minimum"]["brandLinkForeground"]["ratio"], 3.551)
        self.assertFalse(self.report["draftActionForegroundApprovedForOrdinaryText"])
        self.assertFalse(self.report["draftBrandLinkForegroundApprovedForOrdinaryText"])
        self.assertTrue(self.report["reviewRequired"])

    def test_brand_foreground2_is_not_a_universal_dark_text_replacement(self) -> None:
        self.assertEqual(self.report["brandForeground2Below4_5"], 8)
        self.assertEqual(self.report["minimum"]["brandForeground2"]["ratio"], 4.294)
        self.assertFalse(self.report["draftBrandForeground2UniversalTextCandidate"])
        self.assertIn(
            "The brand-preserving direction is approved, but candidate color values and public token names remain gated on editable design review and rendered Blazor/forced-colors/AT evidence.",
            self.report["reviewNotes"],
        )

    def test_approved_brand_preserving_dark_foregrounds_cover_all_roles_and_brands(self) -> None:
        self.assertTrue(self.report["darkBrandForegroundDirectionApproved"])
        self.assertFalse(self.report["darkBrandForegroundValuesApprovedForProduction"])
        self.assertEqual(self.report["darkBrandForegroundCandidatePairs"], 40)
        self.assertEqual(self.report["darkBrandForegroundCandidatesBelow4_5"], 0)
        self.assertEqual(self.report["darkBrandForegroundCandidatesBelow4_6"], 0)
        self.assertGreaterEqual(self.report["darkBrandForegroundCandidateMinimum"], 4.6)
        self.assertEqual(
            set(self.report["darkBrandForegroundCandidateMinimumByRole"]),
            {"action", "linkRest", "linkHover", "linkPressed"},
        )

    def test_generated_css_maps_every_brand_to_its_four_own_dark_candidates(self) -> None:
        root = Path(__file__).resolve().parents[2]
        css = (root / "docs/v3/tokens/issue-418-opt-in.preview.css").read_text(encoding="utf-8")
        matrix = json.loads((root / "docs/v3/tokens/issue-418-brand-matrix.preview.json").read_text(encoding="utf-8"))
        aliases = {
            "action": "--bui-v3-action-foreground",
            "linkRest": "--bui-v3-semantic-link-foreground-rest",
            "linkHover": "--bui-v3-semantic-link-foreground-hover",
            "linkPressed": "--bui-v3-semantic-link-foreground-pressed",
        }
        for brand, entry in matrix["darkBrandForegroundCandidates"].items():
            if not isinstance(entry, dict) or "roles" not in entry:
                continue
            selector = (
                '[data-bui-v3-tokens][data-bui-theme="dark"]:not([data-bui-brand])'
                if brand == "default"
                else f'[data-bui-v3-tokens][data-bui-brand="{brand}"][data-bui-theme="dark"]'
            )
            start = css.index(selector)
            opening = css.index("{", start)
            closing = css.index("}", opening)
            declarations = css[opening:closing]
            for role, alias in aliases.items():
                expected = f"{alias}: {entry['roles'][role]['candidate']};"
                self.assertIn(expected, declarations, f"Wrong {brand}/{role} generated mapping")

    def test_real_styling_lab_exposes_four_scoped_dark_foreground_roles(self) -> None:
        root = Path(__file__).resolve().parents[2]
        css = (root / "docs/v3/tokens/issue-418-opt-in.preview.css").read_text(encoding="utf-8")
        demo = (root / "src/Bluent.UI.Demo.Pages/Pages/Scenarios/V3StylingLab.razor").read_text(encoding="utf-8")
        for alias in (
            "--bui-v3-action-foreground",
            "--bui-v3-link-foreground",
            "--bui-v3-link-foreground-hover",
            "--bui-v3-link-foreground-pressed",
        ):
            self.assertIn(alias, css)
        self.assertIn('[data-bui-v3-tokens][data-bui-theme="light"] .v3-brand-foreground-preview { display: none; }', css)
        for test_id in (
            "v3-brand-foreground-preview",
            "v3-brand-action-rest",
            "v3-brand-link-rest",
            "v3-brand-link-hover",
            "v3-brand-link-pressed",
        ):
            self.assertIn(test_id, demo)

        # Action Rest must be a real Bluent Button; keep the foreground on its text node.
        self.assertRegex(
            demo,
            r'<Button\b(?=[^>]*\bTextClass="v3-brand-foreground-action")(?=[^>]*data-testid="v3-brand-action-rest")[^>]*/>',
        )
        self.assertNotIn('<strong class="v3-brand-foreground-action"', demo)

        schema = json.loads((root / "docs/v3/tokens/issue-418-token-schema.preview.json").read_text(encoding="utf-8-sig"))
        source = {item["name"]: item for item in schema["layers"]["source"]}
        semantic = {item["name"]: item for item in schema["layers"]["semantic"]}
        component = {item["name"]: item for item in schema["layers"]["component"]}
        expected_chain = {
            "rest": ("bluent.color.brandForegroundLink", "bluent.semantic.link.foregroundRest", "bluent.component.link.foregroundRest", "--bui-v3-semantic-link-foreground-rest", "--bui-v3-link-foreground"),
            "hover": ("bluent.color.brandForegroundLinkHover", "bluent.semantic.link.foregroundHover", "bluent.component.link.foregroundHover", "--bui-v3-semantic-link-foreground-hover", "--bui-v3-link-foreground-hover"),
            "pressed": ("bluent.color.brandForegroundLinkPressed", "bluent.semantic.link.foregroundPressed", "bluent.component.link.foregroundPressed", "--bui-v3-semantic-link-foreground-pressed", "--bui-v3-link-foreground-pressed"),
        }
        for state, (source_name, semantic_name, component_name, semantic_css, component_css) in expected_chain.items():
            with self.subTest(link_state=state):
                self.assertEqual(source[source_name]["css"], {"rest": "--colorBrandForegroundLink", "hover": "--colorBrandForegroundLinkHover", "pressed": "--colorBrandForegroundLinkPressed"}[state])
                self.assertEqual(semantic[semantic_name]["alias"], source_name)
                self.assertEqual(semantic[semantic_name]["css"], semantic_css)
                self.assertEqual(component[component_name]["alias"], semantic_name)
                self.assertEqual(component[component_name]["css"], component_css)
                self.assertIn(f"{semantic_css}: var({source[source_name]['css']});", css)
                self.assertIn(f"{component_css}: var({semantic_css});", css)

        self.assertEqual([len(schema["layers"][name]) for name in ("source", "semantic", "component")], [16, 17, 13])
        browser = (root / "scripts/quality/probe_v3_blazor_runtime.mjs").read_text(encoding="utf-8-sig")
        self.assertIn("darkBrandForegroundCandidates", browser)
        self.assertIn("rendered Dark candidate surface matches source", browser)
        self.assertIn("darkBrandForegroundResults.length", browser)
        self.assertIn("darkBrandForegroundFailures", browser)
        self.assertIn("Accessibility.getFullAXTree", browser)
        self.assertIn("complete dark brand foreground runtime matrix", browser)

    def test_primary_text_on_brand_and_proposed_danger_remain_covered(self) -> None:
        self.assertEqual(self.report["currentDangerBelow4_5"], 10)
        self.assertEqual(self.report["suggestedDangerBelow4_5"], 0)
        self.assertEqual(self.report["minimum"]["primaryText"]["ratio"], 14.548)
        self.assertEqual(self.report["minimum"]["onBrand"]["ratio"], 5.552)
        self.assertFalse(self.report["legacyCssModified"])


    def test_brand_hover_foreground_is_contrast_safe_but_state_specific(self) -> None:
        self.assertEqual(self.report["brandForeground2HoverBelow4_5"], 0)
        self.assertEqual(self.report["minimum"]["brandForeground2Hover"]["ratio"], 6.172)
        self.assertFalse(self.report["draftBrandForeground2HoverApprovedForGenericRest"])
        self.assertIn(
            "The source --colorBrandForeground2Hover is above 4.5:1 in all 20 pairs (minimum 6.172:1), but it is a state-specific Hover role, not approval for generic Rest text.",
            self.report["reviewNotes"],
        )

    def test_neutral_foreground_is_safe_baseline_but_not_branded(self) -> None:
        self.assertEqual(self.report["neutralForeground2Below4_5"], 0)
        self.assertEqual(self.report["minimum"]["neutralForeground2"]["ratio"], 10.010)
        self.assertFalse(self.report["neutralForeground2ApprovedAsBrandedAction"])
        self.assertIn(
            "The source --colorNeutralForeground2 is above 4.5:1 in all 20 pairs (minimum 10.010:1), but it removes brand coloration and still requires semantic review.",
            self.report["reviewNotes"],
        )

    def test_link_hover_and_pressed_roles_keep_distinct_dark_gap_patterns(self) -> None:
        self.assertEqual(self.report["brandLinkHoverBelow4_5"], 8)
        self.assertEqual(self.report["minimum"]["brandLinkHover"]["ratio"], 4.294)
        self.assertEqual(
            self.report["brandLinkHoverDarkGapBrands"],
            [
                "default", "office", "outlook", "powerapps",
                "powerpoint", "stream", "teams", "word",
            ],
        )
        self.assertEqual(self.report["brandLinkPressedBelow4_5"], 10)
        self.assertEqual(self.report["minimum"]["brandLinkPressed"]["ratio"], 2.911)
        self.assertEqual(len(self.report["brandLinkPressedDarkGapBrands"]), 10)
        self.assertEqual(self.report["brandForeground2PressedBelow4_5"], 0)
        self.assertEqual(self.report["minimum"]["brandForeground2Pressed"]["ratio"], 10.017)
        self.assertFalse(self.report["brandForeground2PressedApprovedForGenericRest"])
        self.assertFalse(self.report["brandLinkHoverApprovedForRest"])
        self.assertFalse(self.report["brandLinkPressedApprovedForRest"])

    def test_neutral_roles_are_high_contrast_but_not_branded_action_semantics(self) -> None:
        self.assertEqual(self.report["neutralForeground1Below4_5"], 0)
        self.assertEqual(self.report["minimum"]["neutralForeground1"]["ratio"], 14.548)
        self.assertEqual(self.report["neutralLinkForeground2Below4_5"], 0)
        self.assertEqual(self.report["minimum"]["neutralLinkForeground2"]["ratio"], 10.010)
        self.assertEqual(self.report["neutralForeground3Below4_5"], 0)
        self.assertEqual(self.report["minimum"]["neutralForeground3"]["ratio"], 6.193)
        self.assertFalse(self.report["neutralForeground1ApprovedAsBrandedAction"])
        self.assertFalse(self.report["neutralLinkForeground2ApprovedAsBrandedAction"])
        self.assertFalse(self.report["neutralForeground3ApprovedAsBrandedAction"])

    def test_maintainer_approved_label_consumer_roles_keep_the_exact_three_layer_mapping(self) -> None:
        root = Path(__file__).resolve().parents[2]
        schema = json.loads((root / "docs/v3/tokens/issue-418-token-schema.preview.json").read_text(encoding="utf-8-sig"))
        matrix = json.loads((root / "docs/v3/tokens/issue-418-brand-matrix.preview.json").read_text(encoding="utf-8"))
        css = (root / "docs/v3/tokens/issue-418-opt-in.preview.css").read_text(encoding="utf-8")
        source = {item["name"]: item for item in schema["layers"]["source"]}
        semantic = {item["name"]: item for item in schema["layers"]["semantic"]}
        component = schema["layers"]["component"]

        # Maintainer-approved in #430: Label consumes these shared roles; no Label-only token family.
        approved = {
            "bluent.semantic.text.primary": (
                "bluent.color.foreground1", "--colorNeutralForeground1", "--bui-v3-text-primary"
            ),
            "bluent.semantic.text.disabled": (
                "bluent.source.foregroundDisabled", "--colorNeutralForegroundDisabled", "--bui-v3-text-disabled"
            ),
            "bluent.semantic.text.dangerAccessible": (
                "bluent.source.paletteRedForeground1", "--colorPaletteRedForeground1", "--bui-v3-text-danger-accessible"
            ),
        }
        for semantic_name, (source_name, source_css, semantic_css) in approved.items():
            with self.subTest(role=semantic_name):
                self.assertEqual(source[source_name]["css"], source_css)
                self.assertEqual(semantic[semantic_name]["alias"], source_name)
                self.assertEqual(semantic[semantic_name]["css"], semantic_css)
                self.assertIn(f"{semantic_css}: var({source_css});", css)

        self.assertFalse(any(item["name"].startswith("bluent.component.label.") for item in component))
        self.assertFalse(self.report["legacyCssModified"])
        for brand, modes in matrix["brands"].items():
            for mode, entry in modes.items():
                tokens = entry["tokens"]
                for semantic_name, (source_name, _, _) in approved.items():
                    with self.subTest(brand=brand, mode=mode, role=semantic_name):
                        self.assertEqual(tokens[semantic_name], tokens[source_name])


if __name__ == "__main__":
    unittest.main()
