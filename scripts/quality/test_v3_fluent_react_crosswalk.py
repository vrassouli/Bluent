"""Pinned Fluent React API candidate snapshot guards."""
import copy, importlib.util, json, unittest
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2]
SOURCE=ROOT/"scripts/quality/build_v3_fluent_react_crosswalk.py"
spec=importlib.util.spec_from_file_location("fluent_react_candidates_552",SOURCE)
m=importlib.util.module_from_spec(spec); spec.loader.exec_module(m)
class FluentReactCandidateTests(unittest.TestCase):
 @classmethod
 def setUpClass(cls):
  cls.direct=json.loads(m.DIRECT.read_text(encoding="utf-8-sig"))
  cls.inherited=json.loads(m.INHERITED.read_text(encoding="utf-8-sig"))
  cls.data=json.loads(m.RESULT.read_text(encoding="utf-8-sig"))
 def test_18_families_19_classes_and_all_239_source_occurrences(self):
  self.assertEqual(self.data["totals"]["families"],18)
  self.assertEqual(self.data["totals"]["components"],19)
  self.assertEqual(self.data["totals"]["sourceParameterOccurrences"],239)
  self.assertEqual(self.data["totals"]["parametersWithAtLeastOneNameCandidate"],42)
  self.assertEqual(self.data["totals"]["parametersWithoutNameCandidate"],197)
  self.assertEqual(self.data["totals"]["approvedMappings"],0)
  m.validate(self.data,self.direct,self.inherited)
 def test_exact_package_pins_are_present(self):
  self.assertEqual(self.data["fluentReactVersion"],"9.74.10")
  self.assertEqual(len(self.data["sourcePackageVersions"]),14)
  for name,pkg in self.data["sourcePackageVersions"].items():
   self.assertTrue(pkg["version"],name)
   self.assertTrue(pkg["integrity"].startswith("sha512-"),name)
 def test_component_props_and_slots_are_traceable(self):
  for family in self.data["families"]:
   for component in family["components"]:
    for cmp in component["upstreamComparators"]:
     self.assertTrue(cmp["package"])
     self.assertTrue(cmp["version"])
     self.assertTrue(cmp["propsType"])
     self.assertIsInstance(cmp["explicitPropNames"],list)
     self.assertIsInstance(cmp["explicitSlotNames"],list)
    for p in component["parameters"]:
     self.assertTrue((ROOT/p["sourceFile"]).exists())
     self.assertGreater(p["sourceLine"],0)
     self.assertEqual(p["comparisonStatus"],"not_reviewed")
     self.assertEqual(p["featureSupport"],"not_inferred")
 def test_no_dedicated_components_are_not_promoted_to_equivalent(self):
  rows={f["family"]:f for f in self.data["families"]}
  for family in ("DateField","TimeField","MaskedField","OtpField","RangeSlider","FileSelect"):
   self.assertTrue(rows[family]["note"])
   self.assertFalse(rows[family]["parityAccepted"])
   self.assertEqual(rows[family]["apiEquivalence"],"not_reviewed")
 def test_button_and_select_keep_distinct_alternatives(self):
  rows={f["family"]:f for f in self.data["families"]}
  button={c["component"] for x in rows["Button"]["components"] for c in x["upstreamComparators"]}
  select={c["component"] for x in rows["SelectField"]["components"] for c in x["upstreamComparators"]}
  self.assertTrue({"Button","ToggleButton","SplitButton","CompoundButton","MenuButton"}.issubset(button))
  self.assertTrue({"Select","Dropdown","Combobox"}.issubset(select))
 def test_reject_parity_and_parameter_support_claims(self):
  data=copy.deepcopy(self.data); data["parityAccepted"]=True
  with self.assertRaisesRegex(ValueError,"Unauthorized parity approval"): m.validate(data,self.direct,self.inherited)
  data=copy.deepcopy(self.data); data["families"][0]["components"][0]["parameters"][0]["featureSupport"]="supported"
  data["snapshotSha256"]=m.hashlib.sha256(m.json.dumps({k:v for k,v in data.items() if k!="snapshotSha256"},ensure_ascii=False,sort_keys=True,separators=(",",":")).encode("utf-8")).hexdigest()
  with self.assertRaisesRegex(ValueError,"Unauthorized parameter claim"): m.validate(data,self.direct,self.inherited)
 def test_reject_snapshot_tampering(self):
  data=copy.deepcopy(self.data); data["families"][0]["components"][0]["upstreamComparators"][0]["explicitPropNames"].append("fakeProp")
  with self.assertRaisesRegex(ValueError,"Snapshot digest drift"): m.validate(data,self.direct,self.inherited)
 def test_markdown_is_generated_and_approvals_zero(self):
  self.assertEqual(m.REPORT.read_text(encoding="utf-8-sig"),m.render(self.data))
  self.assertIn("0 mappings are approved",m.REPORT.read_text(encoding="utf-8-sig"))
if __name__=="__main__": unittest.main()
