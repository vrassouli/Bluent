"""Research-only name candidate matrix guards; never approve Fluent parity by spelling."""
import copy
import importlib.util
import json
import unittest
from pathlib import Path

ROOT=Path(__file__).resolve().parents[2]
PATH=ROOT / "scripts/quality/build_v3_wc_api_candidates.py"
spec=importlib.util.spec_from_file_location("wc_api_candidates_552",PATH)
m=importlib.util.module_from_spec(spec)
spec.loader.exec_module(m)

class WcNameCandidateTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.direct=json.loads(m.DIRECT.read_text(encoding="utf-8-sig"))
        cls.inherited=json.loads(m.INHERITED.read_text(encoding="utf-8-sig"))
        cls.upstream=json.loads(m.UPSTREAM.read_text(encoding="utf-8-sig"))
        cls.data=json.loads(m.RESULT.read_text(encoding="utf-8-sig"))
    def test_exact_source_occurrence_census(self):
        m.verify(self.data,self.direct,self.inherited,self.upstream)
        self.assertEqual(self.data["totals"]["families"],18)
        self.assertEqual(self.data["totals"]["components"],19)
        self.assertEqual(self.data["totals"]["parameters"],239)
        self.assertEqual(self.data["totals"]["approvedParameterMappings"],0)
    def test_switch_inherited_api_not_lost(self):
        family=next(f for f in self.data["families"] if f["family"]=="Switch")
        comp=family["components"][0]
        self.assertEqual(comp["sourceDirectCount"],0)
        self.assertGreater(comp["sourceLocalInheritedCount"],0)
        self.assertTrue(all(p["origin"]=="local_inherited" for p in comp["parameters"]))
    def test_every_parameter_source_traceable(self):
        for family in self.data["families"]:
            for comp in family["components"]:
                self.assertEqual(len(comp["parameters"]),comp["sourceDirectCount"]+comp["sourceLocalInheritedCount"])
                for param in comp["parameters"]:
                    self.assertTrue((ROOT/param["sourceFile"]).exists(),param["sourceFile"])
                    self.assertGreater(param["sourceLine"],0)
                    self.assertEqual(param["comparisonStatus"],"not_reviewed")
                    self.assertEqual(param["featureSupport"],"not_inferred")
    def test_spelling_candidates_only_from_catalog(self):
        refs={d["tag"]:d for d in self.upstream["referencedTagDetails"]}
        for family in self.data["families"]:
            for comp in family["components"]:
                for p in comp["parameters"]:
                    for candidate in p["spellingCandidates"]:
                        self.assertIn(candidate["tag"],family["referencedTags"])
                        self.assertIn(candidate["member"],refs[candidate["tag"]][candidate["memberKind"]])
                        self.assertEqual(candidate["member"],p["normalizedName"])
    def test_reject_false_approval(self):
        data=copy.deepcopy(self.data)
        data["families"][0]["apiParity"]="verified"
        with self.assertRaisesRegex(ValueError,"drift"):
            m.verify(data,self.direct,self.inherited,self.upstream)
        data=copy.deepcopy(self.data)
        data["families"][0]["components"][0]["parameters"][0]["featureSupport"]="supported"
        with self.assertRaisesRegex(ValueError,"drift"):
            m.verify(data,self.direct,self.inherited,self.upstream)
    def test_reject_upstream_field_drift(self):
        upstream=copy.deepcopy(self.upstream)
        target=next(d for d in upstream["referencedTagDetails"] if d["tag"]=="fluent-button")
        target["attributes"].clear()
        with self.assertRaisesRegex(ValueError,"drift"):
            m.verify(self.data,self.direct,self.inherited,upstream)
    def test_markdown_generated_and_no_claims(self):
        self.assertEqual(m.REPORT.read_text(encoding="utf-8-sig"),m.render(self.data))
        self.assertIn("Approved equivalences: 0",m.REPORT.read_text(encoding="utf-8-sig"))

if __name__=="__main__":
    unittest.main()
