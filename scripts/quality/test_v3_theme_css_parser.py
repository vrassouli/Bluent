#!/usr/bin/env python3
"""#418 theme source parser fail-closed regression tests, no external packages."""
from __future__ import annotations

import json
import tempfile
import unittest
from pathlib import Path

from v3_theme_css_parser import read_theme_variables
from generate_v3_token_preview import ROOT, THEME_DIR, load_source_tokens

SCHEMA = ROOT / "docs/v3/tokens/issue-418-token-schema.preview.json"


class EmittedThemeSourceContract(unittest.TestCase):
    def parse(self, css: str, mode: str = "light"):
        with tempfile.TemporaryDirectory() as temp:
            file = Path(temp) / f"theme-test-{mode}.css"
            file.write_text(css, encoding="utf-8")
            return read_theme_variables(file, mode)

    def test_whole_real_twenty_theme_matrix_has_same_450_keys(self):
        manifest = json.loads(SCHEMA.read_text(encoding="utf-8"))
        names = {token["css"] for token in manifest["layers"]["source"]}
        keys = None
        for brand in manifest["supportedBrands"]:
            for mode in manifest["modes"]:
                with self.subTest(brand=brand, mode=mode):
                    path = THEME_DIR / f"theme-{brand}-{mode}.css"
                    values = read_theme_variables(path, mode)
                    self.assertEqual(len(values), 450)
                    self.assertTrue(names <= values.keys())
                    self.assertEqual(keys or set(values), set(values))
                    keys = set(values)
                    self.assertEqual(load_source_tokens(path, sorted(names)), {k: values[k] for k in sorted(names)})

    def test_inline_comments_are_ignored(self):
        css = "/* --fake: #bad; } */ [data-bui-theme=light] { --real: #ABC; /* --fake: 0; */ --other: 2px; }"
        self.assertEqual(self.parse(css), {"--real": "#ABC", "--other": "2px"})

    def test_comment_only_token_is_never_a_valid_source(self):
        with self.assertRaisesRegex(ValueError, "Malformed or empty"):
            self.parse("[data-bui-theme=light] { /* --real: #ABC; */ }")

    def test_wrong_mode_rejected(self):
        with self.assertRaisesRegex(ValueError, "isolated"):
            self.parse("[data-bui-theme=dark] { --real: #ABC; }")

    def test_additional_override_rule_rejected(self):
        css = "[data-bui-theme=light] { --real: #ABC; } .unsafe { --real: #DEF; }"
        with self.assertRaisesRegex(ValueError, "isolated"):
            self.parse(css)

    def test_duplicate_even_identical_variable_rejected(self):
        with self.assertRaisesRegex(ValueError, "Duplicate"):
            self.parse("[data-bui-theme=light] { --real: #ABC; --real: #ABC; }")

    def test_malformed_css_declaration_rejected(self):
        with self.assertRaisesRegex(ValueError, "Malformed or empty"):
            self.parse("[data-bui-theme=light] { --real: #ABC; color: red; }")

    def test_missing_semicolon_rejected(self):
        with self.assertRaisesRegex(ValueError, "Malformed or empty"):
            self.parse("[data-bui-theme=light] { --real: #ABC }")


if __name__ == "__main__":
    unittest.main()
