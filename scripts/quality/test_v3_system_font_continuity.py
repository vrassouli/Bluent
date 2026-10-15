#!/usr/bin/env python3
"""Negative controls for source-only, no-new-font #418 policy."""
import copy
import json
import unittest
from pathlib import Path
from audit_v3_system_font_continuity import inspect,validate
from generate_v3_scoped_brands import read_source
ROOT=Path(__file__).resolve().parents[2]
POLICY=json.loads((ROOT/"docs/v3/tokens/issue-418-system-font-continuity.json").read_text(encoding="utf-8"))
SOURCE={(b,m):read_source(b,m) for b in POLICY["source"]["brands"] for m in POLICY["source"]["modes"]}
FONTS=[POLICY["packaging"]["existingIconFontSubdirectory"]+"/"+f
       for f in POLICY["packaging"]["expectedExistingIconFontFiles"]]
class SystemFontContinuity(unittest.TestCase):
    def test_real_twenty_brand_mode_sources_and_icon_fonts(self):
        self.assertTrue(inspect()["pass"],inspect())
    def test_rejects_one_brand_css_stack_drift(self):
        m=copy.deepcopy(SOURCE)
        m[("word","dark")]["--fontFamilyBase"]="'NewFont', sans-serif"
        self.assertRegex(str(validate(POLICY,m,FONTS)),r"word/dark")
    def test_rejects_unquoted_penpot_multiword_family(self):
        p=copy.deepcopy(POLICY)
        p["penpot"]["quotedRawValue"]="Segoe UI"
        self.assertRegex(str(validate(p,SOURCE,FONTS)),r"Penpot")
    def test_rejects_added_text_font_file(self):
        e=validate(POLICY,SOURCE,FONTS+["src/Bluent.UI/wwwroot/fonts/NewFont.woff2"])
        self.assertRegex(str(e),r"Unexpected/new/missing font")
    def test_rejects_missing_existing_icon_font(self):
        self.assertTrue(validate(POLICY,SOURCE,FONTS[:-1]))
    def test_rejects_unverified_native_approval(self):
        p=copy.deepcopy(POLICY)
        p["acceptance"]["screenReaderApproved"]=True
        self.assertRegex(str(validate(p,SOURCE,FONTS)),r"Cannot certify")
    def test_rejects_incomplete_matrix(self):
        m=copy.deepcopy(SOURCE)
        del m[("default","dark")]
        self.assertRegex(str(validate(POLICY,m,FONTS)),r"Incomplete")
if __name__=="__main__":unittest.main()
