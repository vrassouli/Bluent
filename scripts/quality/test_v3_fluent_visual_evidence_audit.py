"""Tests for the #552 visual screenshot-evidence coverage audit."""
import json
import unittest
from pathlib import Path

import build_v3_fluent_visual_evidence_audit as builder
import build_v3_fluent_responsive_rtl_audit as rtl_audit

ROOT=Path(__file__).resolve().parents[2]
QUALITY=ROOT/'docs/v3/quality'
MATRIX=QUALITY/'FLUENT-PARITY-RETRO-AUDIT.json'


class VisualEvidenceAuditTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.ledger,cls.report=builder.build()
        cls.by_family={f['family']:f for f in cls.ledger['families']}
        cls.matrix=json.loads(MATRIX.read_text(encoding='utf-8-sig'))

    def test_exact_18_family_coverage_and_matrix_dimension(self):
        self.assertEqual(18,self.ledger['familyCount'])
        self.assertEqual({f['family'] for f in self.matrix['families']},set(self.by_family))
        self.assertEqual('visual',self.ledger['dimension'])
        self.assertEqual('audited_gaps',self.ledger['dimensionStatus'])
        for f in self.matrix['families']:
            self.assertEqual('audited_gaps',f['dimensions']['visual'],f['family'])

    def test_light_dark_rtl_and_forced_colors_evidence_is_linked_for_all_families(self):
        c=self.ledger['coverageSummary']
        self.assertEqual(18,c['lightLtr'])
        self.assertEqual(18,c['darkRtl'])
        self.assertEqual(18,c['forcedColors'])

    def test_state_and_reflow_coverage_gaps_are_not_hidden(self):
        c=self.ledger['coverageSummary']
        self.assertEqual(3,c['reducedMotion'])
        self.assertEqual(17,c['focusState'])
        self.assertEqual(1,c['hoverState'])
        self.assertEqual(4,c['disabledState'])
        self.assertEqual(10,c['pressedOrSelectedState'])
        self.assertEqual(5,c['narrowOrZoomProxy'])

    def test_narrow_or_zoom_proxy_is_limited_to_five_families(self):
        expected={'Button','Icon','Slider','RangeSlider','FileSelect'}
        actual={f['family'] for f in self.ledger['families'] if f['coverage']['narrowOrZoomProxy']}
        self.assertEqual(expected,actual)
        self.assertIn('not native browser UI zoom',self.ledger['runtimeScope'])

    def test_visual_design_coverage_matches_live_penpot_snapshot(self):
        with_design={f['family'] for f in self.ledger['families'] if f['designPages']}
        self.assertEqual({'Button','Icon','TextField','Checkbox','Switch','Slider','RangeSlider'},with_design)
        self.assertEqual(7,sum(bool(f['designPages']) for f in self.ledger['families']))
        self.assertEqual(11,sum(not f['designPages'] for f in self.ledger['families']))
        self.assertIn('incomplete',self.by_family['Icon']['visualGap'])
        self.assertEqual('dedicated-review-board-incomplete-variant-coverage',self.by_family['Icon']['designArtifactStatus'])
        for family in ('Slider','RangeSlider'):
            self.assertIn('review board',self.by_family[family]['visualGap'])
            self.assertEqual('dedicated-review-board-incomplete-variant-coverage',self.by_family[family]['designArtifactStatus'])

    def test_evidence_and_source_files_exist(self):
        for f in self.ledger['families']:
            self.assertTrue(f['browserEvidence'],f['family'])
            for item in f['browserEvidence']:
                self.assertTrue((QUALITY/item['file']).is_file(),item['file'])
            for rel in f['styleFiles']+f['sourceFiles']:
                self.assertTrue((ROOT/rel).is_file(),rel)
            self.assertTrue((ROOT/f['familyReport']).is_file(),f['familyReport'])

    def test_visual_audit_does_not_claim_pixel_parity(self):
        self.assertFalse(self.ledger['parityAccepted'])
        self.assertIn('No pixel-diff or complete side-by-side design comparison was performed',self.ledger['runtimeScope'])
        self.assertIn('not a visual parity verdict',self.report)

    def test_forced_colors_and_zoom_limitations_are_explicit(self):
        self.assertIn('Forced-colors emulation',self.report)
        self.assertIn('not native browser UI zoom',self.report)
        self.assertIn('Native OS high-contrast',self.ledger['runtimeScope'])

    def test_no_family_is_approved_by_visual_evidence_inventory(self):
        self.assertTrue(self.ledger['noneApproved'])
        for f in self.ledger['families']:
            self.assertEqual('pending',f['designApproval'])
            self.assertIsNone(f['evidenceBundle'])

    def test_missing_family_negative_control_fails_closed(self):
        saved=rtl_audit.EVIDENCE.pop('Button')
        try:
            with self.assertRaisesRegex(ValueError,'exactly all 18 families'):
                builder.build()
        finally:
            rtl_audit.EVIDENCE['Button']=saved

    def test_checked_in_outputs_match_builder(self):
        self.assertEqual(self.ledger,json.loads((QUALITY/'FLUENT-PARITY-VISUAL-EVIDENCE-AUDIT.json').read_text(encoding='utf-8-sig')))
        self.assertEqual(self.report,(QUALITY/'FLUENT-PARITY-VISUAL-EVIDENCE-AUDIT.md').read_text(encoding='utf-8-sig'))


if __name__=='__main__':
    unittest.main()
