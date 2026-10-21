"""#552 / #420 editable Penpot design-review handoff integrity; NOT Penpot approval."""
import json
import unittest
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2]
REPORT=ROOT/"docs/v3/quality/FOCUS-KEYBOARD-PENPOT-REVIEW-420.md"
MATRIX=ROOT/"docs/v3/quality/FOCUS-KEYBOARD-ACCEPTANCE-MATRIX.json"
class PenpotFocusReview(unittest.TestCase):
 @classmethod
 def setUpClass(cls):
  cls.report=REPORT.read_text(encoding="utf-8-sig")
 def test_correct_bluent_file_not_unrelated_design(self):
  self.assertIn("Bluent v3 Design System",self.report)
  self.assertIn("b64f6665-c9ab-80b5-8008-c4ac99d9d000",self.report)
  self.assertNotIn("b64f6665-c9ab-80b5-8008-c44ed391c0c4",self.report)
 def test_concrete_page_board_and_layout_evidence(self):
  for value in ("ed5216bd-3d5b-8015-8008-cb247e27efb4","4d22aead-d6ef-801a-8008-d2dfd28e6d18","81","x=1820","1500"):
   self.assertIn(value,self.report)
  self.assertIn("right",self.report.lower())
 def test_explicit_design_not_approved(self):
  for text in ("PROPOSED","NOT APPROVED","REVIEW REQUIRED","No product source","#552"):
   self.assertIn(text.lower(),self.report.lower())
 def test_owner_semantics_all_mapped(self):
  for issue in (420,465,466,469,507,517):
   self.assertIn("#"+str(issue),self.report)
  for term in ("SelectedId","FocusAsync","Escape","aria-","RTL","disabled"):
   self.assertIn(term.lower(),self.report.lower())
 def test_cross_references_to_actual_source_evidence(self):
  for document in ("FOCUS-KEYBOARD-ARCHITECTURE-PROPOSAL.md","BLUENT-BLAZOR-FOCUS-REAL-LIFECYCLE.md","FOCUS-KEYBOARD-ACCEPTANCE-MATRIX.json"):
   self.assertIn(document,self.report)
   self.assertTrue((REPORT.parent/document).is_file())
 def test_all_33_owner_cases_still_planned(self):
  m=json.loads(MATRIX.read_text(encoding="utf8"))
  self.assertEqual(33,len(m["cases"]))
  self.assertEqual("not-executed",m["validation_status"])
  self.assertTrue(all(c["status"]=="planned" and c["evidence"] is None for c in m["cases"]))
if __name__=="__main__":unittest.main()
