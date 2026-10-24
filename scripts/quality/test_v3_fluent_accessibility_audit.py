"""Tests for the #552 accessibility semantics audit."""
import json
import unittest
from pathlib import Path

import build_v3_fluent_accessibility_audit as builder

ROOT=Path(__file__).resolve().parents[2]
QUALITY=ROOT/'docs/v3/quality'
MATRIX=QUALITY/'FLUENT-PARITY-RETRO-AUDIT.json'


class AccessibilityAuditTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.ledger,cls.report=builder.build()
        cls.by_family={f['family']:f for f in cls.ledger['families']}
        cls.matrix=json.loads(MATRIX.read_text(encoding='utf-8-sig'))

    def test_exact_18_family_coverage_and_matrix_dimension(self):
        self.assertEqual(18,self.ledger['familyCount'])
        self.assertEqual({f['family'] for f in self.matrix['families']},set(self.by_family))
        self.assertEqual('accessibility',self.ledger['dimension'])
        self.assertEqual('audited_gaps',self.ledger['dimensionStatus'])
        for f in self.matrix['families']:
            self.assertEqual('audited_gaps',f['dimensions']['accessibility'],f['family'])

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
            for rel in f['browserEvidence']:
                self.assertTrue((QUALITY/rel).is_file(),rel)

    def test_button_toggle_and_icon_name_gaps_are_explicit(self):
        self.assertIn('aria-pressed',self.by_family['Button']['knownGap'])
        self.assertIn('accessible naming',self.by_family['Icon']['knownGap'])

    def test_checkbox_switch_and_radio_semantics_are_explicit(self):
        self.assertIn('aria-checked is absent',self.by_family['Checkbox']['knownGap'])
        self.assertIn('checkbox rather than switch',self.by_family['Switch']['knownGap'])
        self.assertIn('group has no accessible group name',self.by_family['RadioGroup']['knownGap'])

    def test_slider_semantics_are_explicit(self):
        self.assertIn('No native slider semantics',self.by_family['Slider']['knownGap'])
        self.assertIn('independent slider role/value',self.by_family['RangeSlider']['knownGap'])

    def test_otp_localization_and_file_remove_names_are_explicit(self):
        self.assertIn('hard-coded English',self.by_family['OtpField']['knownGap'])
        self.assertIn('glyph-only accessible name',self.by_family['FileSelect']['knownGap'])

    def test_accessible_name_and_form_name_are_not_conflated(self):
        self.assertIn('named textbox: Example text field',self.by_family['TextField']['observedSemantics'])
        self.assertIn('native input name attribute is empty',self.by_family['TextField']['knownGap'])

    def test_native_at_and_os_contrast_limits_are_explicit(self):
        self.assertIn('not a native screen-reader test',self.ledger['runtimeScope'])
        self.assertIn('not native OS high contrast',self.ledger['runtimeScope'])
        self.assertIn('not an accessibility conformance claim',self.ledger['acceptanceBoundary'])

    def test_no_family_is_approved_by_accessibility_audit(self):
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
        self.assertEqual(self.ledger,json.loads((QUALITY/'FLUENT-PARITY-ACCESSIBILITY-AUDIT.json').read_text(encoding='utf-8-sig')))
        self.assertEqual(self.report,(QUALITY/'FLUENT-PARITY-ACCESSIBILITY-AUDIT.md').read_text(encoding='utf-8-sig'))


if __name__=='__main__':
    unittest.main()
