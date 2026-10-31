"""Negative controls for the draft v3 NuGet boundary validator; stdlib only."""
from __future__ import annotations
import json
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path
from zipfile import ZipFile

ROOT = Path(__file__).resolve().parents[2]
CHECK = ROOT / "scripts/quality/check_v3_nuget_boundary.py"
BASE = {
    "staticwebassets/bluent.ui.components.min.css",
    *(f"staticwebassets/bluent.ui.theme.{b}.min.css" for b in
      ("default", "excel", "office", "outlook", "powerapps",
       "powerbi", "powerpoint", "stream", "teams", "word")),
    "staticwebassets/v3/issue-418-dialog-focus.preview.js",
    "staticwebassets/v3/danger-toggle.opt-in.preview.css",
}


class NugetBoundaryTests(unittest.TestCase):
    def run_probe(self, names: set[str]) -> tuple[int, dict]:
        with tempfile.TemporaryDirectory() as folder:
            package = Path(folder) / "Bluent.UI.test.nupkg"
            with ZipFile(package, "w") as archive:
                for name in sorted(names):
                    content = (
                        (ROOT / "src/Bluent.UI/wwwroot/v3/danger-toggle.opt-in.preview.css").read_bytes()
                        if name == "staticwebassets/v3/danger-toggle.opt-in.preview.css"
                        else b"research test fixture only"
                    )
                    archive.writestr(name, content)
            result = subprocess.run(
                [sys.executable, str(CHECK), str(package)],
                cwd=ROOT, text=True, stdout=subprocess.PIPE,
                stderr=subprocess.PIPE, check=False,
            )
            self.assertFalse(result.stderr, result.stderr)
            return result.returncode, json.loads(result.stdout)

    def test_valid_opt_in_dependency_and_ten_legacy_themes(self):
        rc, data = self.run_probe(BASE)
        self.assertEqual(rc, 0)
        self.assertTrue(data["pass"])
        self.assertTrue(data["optInDialogDependencyPresent"])
        self.assertTrue(data["optInDangerCssPresent"])
        self.assertTrue(data["optInDangerCssSourceIdentical"])

    def test_missing_legacy_theme_is_rejected(self):
        rc, data = self.run_probe(BASE - {"staticwebassets/bluent.ui.theme.word.min.css"})
        self.assertNotEqual(rc, 0)
        self.assertIn("Missing legacy CSS", " ".join(data["errors"]))

    def test_missing_dialog_import_dependency_is_rejected(self):
        rc, data = self.run_probe(BASE - {"staticwebassets/v3/issue-418-dialog-focus.preview.js"})
        self.assertNotEqual(rc, 0)
        self.assertFalse(data["optInDialogDependencyPresent"])

    def test_missing_reviewed_v3_danger_css_is_rejected(self):
        rc, data = self.run_probe(BASE - {"staticwebassets/v3/danger-toggle.opt-in.preview.css"})
        self.assertNotEqual(rc, 0)
        self.assertFalse(data["optInDangerCssPresent"])
        self.assertIn("Danger toggle stylesheet missing", " ".join(data["errors"]))

    def test_tampered_opt_in_danger_css_is_rejected(self):
        with tempfile.TemporaryDirectory() as folder:
            package = Path(folder) / "Bluent.UI.test.nupkg"
            with ZipFile(package, "w") as archive:
                for name in sorted(BASE):
                    archive.writestr(
                        name,
                        b"/* empty, stale, or tampered stylesheet */"
                        if name == "staticwebassets/v3/danger-toggle.opt-in.preview.css"
                        else b"research test fixture only",
                    )
            result = subprocess.run(
                [sys.executable, str(CHECK), str(package)],
                cwd=ROOT, text=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE, check=False,
            )
            self.assertFalse(result.stderr, result.stderr)
            data = json.loads(result.stdout)
            self.assertNotEqual(result.returncode, 0)
            self.assertFalse(data["optInDangerCssSourceIdentical"])
            self.assertIn("differs from reviewed source bytes", " ".join(data["errors"]))

    def test_design_only_css_preview_is_rejected(self):
        rc, data = self.run_probe(BASE | {"staticwebassets/v3/issue-418.opt-in.preview.css"})
        self.assertNotEqual(rc, 0)
        self.assertIn("issue-418.opt-in.preview.css", str(data["errors"]))

    def test_only_preexisting_icon_fonts_are_allowed(self):
        icons = {
            "staticwebassets/fonts/icons/FluentSystemIcons-Resizable.ttf",
            "staticwebassets/fonts/icons/FluentSystemIcons-Resizable.woff",
            "staticwebassets/fonts/icons/FluentSystemIcons-Resizable.woff2",
        }
        rc, result = self.run_probe(BASE | icons)
        self.assertEqual(rc, 0, result)
        self.assertEqual(result["unapprovedFontAssets"], [])
        self.assertEqual(set(result["allowedLegacyIconFontsPresent"]), icons)

    def test_new_font_binary_in_any_archive_directory_is_rejected(self):
        for name in (
            "staticwebassets/fonts/PersianBody.woff2",
            "staticwebassets/extra/BrandFont.otf",
            "contentFiles/any/net10.0/wwwroot/Another.ttf",
            "staticwebassets/fonts/icons/UnknownIcon.woff",
        ):
            with self.subTest(name=name):
                rc, result = self.run_probe(BASE | {name})
                self.assertNotEqual(rc, 0)
                self.assertIn(name, result["unapprovedFontAssets"])
                self.assertIn("Unexpected bundled text/unapproved font", str(result["errors"]))

    def test_unreviewed_v3_component_js_is_rejected(self):
        rc, data = self.run_probe(BASE | {"staticwebassets/v3/button-experiment.js"})
        self.assertNotEqual(rc, 0)
        self.assertIn("button-experiment.js", str(data["errors"]))


if __name__ == "__main__":
    unittest.main()
