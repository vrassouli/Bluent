"""Tests for the #552 interactive behavior audit."""
import json
import unittest
from pathlib import Path

import build_v3_fluent_behavior_audit as builder

ROOT=Path(__file__).resolve().parents[2]
QUALITY=ROOT/'docs/v3/quality'
MATRIX=QUALITY/'FLUENT-PARITY-RETRO-AUDIT.json'


class BehaviorAuditTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.ledger,cls.report=builder.build()
        cls.by_family={f['family']:f for f in cls.ledger['families']}
        cls.matrix=json.loads(MATRIX.read_text(encoding='utf-8-sig'))

    def test_exact_18_family_coverage_and_matrix_dimension(self):
        self.assertEqual(18,self.ledger['familyCount'])
        self.assertEqual({f['family'] for f in self.matrix['families']},set(self.by_family))
        self.assertEqual('behavior',self.ledger['dimension'])
        self.assertEqual('audited_gaps',self.ledger['dimensionStatus'])
        for f in self.matrix['families']:
            self.assertEqual('audited_gaps',f['dimensions']['behavior'],f['family'])

    def test_source_files_and_anchors_exist(self):
        for f in self.ledger['families']:
            self.assertTrue(f['sourceFiles'],f['family'])
            self.assertTrue(f['sourceSnippets'],f['family'])
            for rel in f['sourceFiles']:
                self.assertTrue((ROOT/rel).is_file(),rel)
            for item in f['sourceSnippets']:
                self.assertTrue((ROOT/item['path']).is_file(),item['path'])
                self.assertGreaterEqual(item['line'],1)
                self.assertTrue(item['excerpt'])

    def test_browser_evidence_and_family_reports_exist(self):
        for f in self.ledger['families']:
            self.assertTrue((ROOT/f['familyReport']).is_file(),f['familyReport'])
            self.assertTrue(f['browserEvidence'],f['family'])
            for rel in f['browserEvidence']:
                self.assertTrue((QUALITY/rel).is_file(),rel)

    def test_known_control_and_selection_findings_are_preserved(self):
        self.assertIn('input.indeterminate',self.by_family['Checkbox']['knownGap'])
        self.assertIn('ArrowRight',self.by_family['RadioGroup']['knownGap'])
        self.assertIn('BindValueEvent',self.by_family['SelectField']['knownGap'])
        self.assertIn('0991-234-5678',self.by_family['MaskedField']['knownGap'])

    def test_typed_input_and_otp_evidence_are_scoped(self):
        self.assertIn('integer input updates the bound display',self.by_family['NumericField']['observedBehavior'])
        self.assertIn('Native ArrowDown',self.by_family['SelectField']['observedBehavior'])
        self.assertIn('synthetic paste',self.by_family['OtpField']['observedBehavior'])
        self.assertIn('Native clipboard/IME',self.by_family['OtpField']['knownGap'])

    def test_pointer_controls_are_not_claimed_keyboard_accessible(self):
        self.assertIn('no native slider role, tabindex or keyboard behavior',self.by_family['Slider']['knownGap'])
        self.assertIn('lacks native keyboard semantics',self.by_family['RangeSlider']['knownGap'])

    def test_file_select_limit_and_disabled_gaps_are_explicit(self):
        self.assertIn('MaxFiles=2 accepts three files',self.by_family['FileSelect']['knownGap'])
        self.assertIn('Disabled affects the trigger only',self.by_family['FileSelect']['knownGap'])

    def test_render_mode_and_at_limits_are_explicit(self):
        self.assertIn('not a full published InteractiveServer matrix',self.ledger['runtimeScope'])
        self.assertIn('not native OS/screen-reader acceptance',self.ledger['runtimeScope'])
        self.assertIn('not accepted',self.report)

    def test_no_family_is_approved_by_behavior_audit(self):
        self.assertFalse(self.ledger['parityAccepted'])
        self.assertTrue(self.ledger['noneApproved'])
        for f in self.ledger['families']:
            self.assertEqual('pending',f['designApproval'])
            self.assertIsNone(f['evidenceBundle'])

    def test_missing_family_negative_control_fails_closed(self):
        saved=builder.A.pop('Button')
        try:
            with self.assertRaisesRegex(ValueError,'exactly all 18 families'):
                builder.build()
        finally:
            builder.A['Button']=saved

    def test_checked_in_outputs_match_builder(self):
        self.assertEqual(self.ledger,json.loads((QUALITY/'FLUENT-PARITY-BEHAVIOR-AUDIT.json').read_text(encoding='utf-8-sig')))
        self.assertEqual(self.report,(QUALITY/'FLUENT-PARITY-BEHAVIOR-AUDIT.md').read_text(encoding='utf-8-sig'))


if __name__=='__main__':
    unittest.main()
