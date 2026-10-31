"""#418 focus alias-chain and source contrast checks for the opt-in v3 draft."""
import json
from pathlib import Path
import sys
import unittest

ROOT=Path(__file__).resolve().parents[2]
sys.path.insert(0,str(ROOT/"scripts"/"quality"))
from generate_v3_token_preview import contract, SCHEMA, MATRIX_OUT

def rgb(h):
    t=h.lstrip("#")
    return tuple(int(t[i:i+2],16)/255 for i in (0,2,4))

def lum(h):
    c=rgb(h)
    v=[x/12.92 if x<=0.04045 else ((x+0.055)/1.055)**2.4 for x in c]
    return v[0]*0.2126+v[1]*0.7152+v[2]*0.0722

def ratio(a,b):
    x,y=sorted((lum(a),lum(b)),reverse=True)
    return (x+0.05)/(y+0.05)

class Focus2AliasDraftTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.schema=json.loads(SCHEMA.read_text(encoding="utf-8"))
        cls.matrix=json.loads(MATRIX_OUT.read_text(encoding="utf-8"))["brands"]
        cls.layers=cls.schema["layers"]

    def test_actual_source_alias_component_chain(self):
        source=next(t for t in self.layers["source"] if t["name"]=="bluent.source.focusStroke2")
        sem=next(t for t in self.layers["semantic"] if t["name"]=="bluent.semantic.focusRing.strongCandidate")
        cmp=next(t for t in self.layers["component"] if t["name"]=="bluent.component.button.focusOuterCandidate")
        self.assertEqual(source["css"],"--colorStrokeFocus2")
        self.assertEqual(sem["alias"],source["name"])
        self.assertEqual(cmp["alias"],sem["name"])
        self.assertEqual(sem["css"],"--bui-v3-focus-ring-strong-candidate")
        self.assertEqual(cmp["css"],"--bui-v3-button-focus-outer-candidate")

    def test_ten_brands_light_dark_focus_contrast(self):
        samples=[]
        for brand,modes in self.matrix.items():
            for mode,entry in modes.items():
                tokens=entry["tokens"]
                source=tokens["bluent.source.focusStroke2"]
                surface=tokens["bluent.semantic.surface.default"]
                self.assertEqual(source,tokens["bluent.semantic.focusRing.strongCandidate"])
                self.assertEqual(source,tokens["bluent.component.button.focusOuterCandidate"])
                self.assertGreaterEqual(ratio(source,surface),3.0,brand+"/"+mode)
                samples.append((brand,mode))
        self.assertEqual(len(samples),20)

    def test_old_brand_focus_unchanged_and_not_overwritten(self):
        names={t["name"]:t for t in self.layers["semantic"]}
        self.assertEqual(names["bluent.semantic.border.focus"]["alias"],"bluent.color.brandBackground")
        css,matrix=contract(self.schema)
        self.assertIn("--bui-v3-border-focus: var(--colorBrandBackground);",css)
        self.assertIn("--bui-v3-focus-ring-strong-candidate: var(--colorStrokeFocus2);",css)
        self.assertIn("--bui-v3-button-focus-outer-candidate: var(--bui-v3-focus-ring-strong-candidate);",css)
        self.assertNotIn("--colorStrokeFocus2:",css)
        self.assertEqual(len(matrix["brands"]),10)

    def test_preview_scope_is_explicit_and_not_global(self):
        css,_=contract(self.schema)
        self.assertTrue(css.startswith("/* AUTO-GENERATED"))
        self.assertIn("[data-bui-v3-tokens][data-bui-theme]",css)
        self.assertNotIn(":root {",css)

if __name__=="__main__":
    unittest.main()
