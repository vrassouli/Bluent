"""Fail-closed checks for the opt-in #418 public CSS contract."""
from __future__ import annotations

import json
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
SCHEMA = ROOT / "docs/v3/tokens/issue-418-token-schema.preview.json"
MATRIX = ROOT / "docs/v3/tokens/issue-418-brand-matrix.preview.json"
PARTIAL = ROOT / "src/Bluent.UI/Styles/Components/_v3-token-contract.scss"
ENTRY = ROOT / "src/Bluent.UI/Styles/Components/components.scss"


class Issue418PublicTokenBridgeTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.schema = json.loads(SCHEMA.read_text(encoding="utf-8"))
        cls.matrix = json.loads(MATRIX.read_text(encoding="utf-8"))
        cls.css = PARTIAL.read_text(encoding="utf-8")
        cls.entry = ENTRY.read_text(encoding="utf-8")

    def test_only_nine_public_color_roles_are_serialized(self):
        public = {
            item["name"]: item["css"]
            for item in self.schema["layers"]["source"]
            if item["name"].startswith("bluent.color.")
        }
        self.assertEqual(len(public), 9)
        aliases = {
            "bluent.color.background1": "--bui-v3-color-background1",
            "bluent.color.foreground1": "--bui-v3-color-foreground1",
            "bluent.color.foreground4": "--bui-v3-color-foreground4",
            "bluent.color.brandBackground": "--bui-v3-color-brand-background",
            "bluent.color.stroke1": "--bui-v3-color-stroke1",
            "bluent.color.brandForeground1": "--bui-v3-color-brand-foreground1",
            "bluent.color.brandForegroundLink": "--bui-v3-color-brand-foreground-link",
            "bluent.color.brandForegroundLinkHover": "--bui-v3-color-brand-foreground-link-hover",
            "bluent.color.brandForegroundLinkPressed": "--bui-v3-color-brand-foreground-link-pressed",
        }
        for role, alias in aliases.items():
            with self.subTest(role=role):
                source_css = public[role]
                self.assertIn(f"{alias}: var({source_css});", self.css)
        self.assertNotIn("bluent.source.", self.css)
        self.assertNotIn("bluent.component.", self.css)

    def test_semantic_allowlist_is_limited_to_accepted_text_consumers(self):
        expected = {
            "--bui-v3-text-primary: var(--bui-v3-color-foreground1);",
            "--bui-v3-text-disabled: var(--colorNeutralForegroundDisabled);",
            "--bui-v3-text-placeholder: var(--bui-v3-color-foreground4);",
        }
        for declaration in expected:
            self.assertIn(declaration, self.css)
        for forbidden in (
            "--bui-v3-text-danger-accessible:",
            "--bui-v3-status-danger:",
            "--bui-v3-semantic-link-foreground-rest:",
            "--bui-v3-semantic-link-foreground-hover:",
            "--bui-v3-semantic-link-foreground-pressed:",
            "--bui-v3-action-foreground:",
            "--bui-v3-text-validation:",
        ):
            self.assertNotIn(forbidden, self.css)
        self.assertIn("Label #430", (ROOT / "docs/v3/tokens/PUBLIC-TOKEN-VOCABULARY-PROPOSAL.md").read_text(encoding="utf-8"))

    def test_dark_candidates_remain_review_only_and_are_not_promoted_to_bundle(self):
        candidates = self.matrix["darkBrandForegroundCandidates"]
        brands = self.schema["supportedBrands"]
        self.assertEqual(len(brands), 10)
        self.assertEqual(candidates["minimumContrastRatio"], 4.5)
        self.assertEqual(candidates["targetContrastRatio"], 4.6)
        for brand in brands:
            entry = candidates[brand]
            self.assertEqual(set(entry["roles"]), {"action", "linkRest", "linkHover", "linkPressed"})
            self.assertEqual(entry["background"], "#292929")
            for role in entry["roles"].values():
                self.assertGreaterEqual(role["contrastRatio"], 4.6)
        self.assertNotIn("darkBrandForegroundCandidates", self.css)
        self.assertNotIn("--bui-v3-action-foreground:", self.css)

    def test_focus_host_metadata_is_same_painted_host_and_fail_closed(self):
        hosts = ("neutral", "brand", "brandHover", "danger", "inverted")
        for mode in ("light", "dark"):
            for host in hosts:
                selector = f'[data-bui-v3-focus-mode="{mode}"][data-bui-v3-focus-host="{host}"]'
                self.assertIn(selector, self.css)
        self.assertIn("--bui-button-focus-ring-color: var(--colorBrandBackground);", self.css)
        self.assertIn("--bui-button-focus-ring-color: var(--colorNeutralForegroundOnBrand);", self.css)
        self.assertIn("--bui-button-focus-ring-color: var(--colorBrandForeground2);", self.css)
        self.assertIn("@media (forced-colors: active)", self.css)
        self.assertIn("--bui-button-focus-ring-color: Highlight;", self.css)
        # Keep the existing 2px geometry and focus-visible selector; no universal Button selector is added here.
        button = (ROOT / "src/Bluent.UI/Styles/Components/_button.scss").read_text(encoding="utf-8")
        self.assertIn("outline: 2px solid var(--bui-button-focus-ring-color", button)
        self.assertIn("outline-offset: 2px", button)
        self.assertNotIn(".bui-button:focus-visible", self.css)
        self.assertIn("data-bui-v3-focus-host", self.css)
        self.assertIn("data-bui-v3-focus-mode", self.css)

    def test_partial_is_included_after_button_source(self):
        button = self.entry.index('@import "_button.scss";')
        token = self.entry.index('@import "_v3-token-contract.scss";')
        self.assertLess(button, token)
        self.assertIn("[data-bui-v3-tokens][data-bui-theme]", self.css)


if __name__ == "__main__":
    unittest.main()
