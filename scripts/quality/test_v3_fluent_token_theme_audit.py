"""Tests for the #552 token/theme source inventory."""
import json
import unittest
from pathlib import Path

import build_v3_fluent_token_theme_audit as builder

ROOT=Path(__file__).resolve().parents[2]
QUALITY=ROOT/'docs/v3/quality'
MATRIX=QUALITY/'FLUENT-PARITY-RETRO-AUDIT.json'


class TokenThemeAuditTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.ledger,cls.report=builder.build()
        cls.by_family={f['family']:f for f in cls.ledger['families']}
        cls.matrix=json.loads(MATRIX.read_text(encoding='utf-8-sig'))

    def test_exact_18_family_coverage_and_matrix_dimension(self):
        self.assertEqual(18,self.ledger['familyCount'])
        self.assertEqual({f['family'] for f in self.matrix['families']},set(self.by_family))
        self.assertEqual('tokenTheme',self.ledger['dimension'])
        self.assertEqual('audited_gaps',self.ledger['dimensionStatus'])
        for f in self.matrix['families']:
            self.assertEqual('audited_gaps',f['dimensions']['tokenTheme'],f['family'])

    def test_light_dark_theme_source_files_exist(self):
        for rel in self.ledger['themeSourceFiles']:
            self.assertTrue((ROOT/rel).is_file(),rel)
        self.assertIn('--colorNeutral',self.ledger['themeTokenPrefixes'])
        self.assertIn('--colorBrand',self.ledger['themeTokenPrefixes'])
        self.assertIn('--spacing',self.ledger['themeTokenPrefixes'])

    def test_style_and_component_sources_exist(self):
        for f in self.ledger['families']:
            self.assertTrue(f['componentSourceFiles'],f['family'])
            for rel in f['componentSourceFiles']:
                self.assertTrue((ROOT/rel).is_file(),rel)
            for rel in f['styleFiles']:
                self.assertTrue((ROOT/rel).is_file(),rel)
            for snip in f['sourceSnippets']:
                self.assertTrue((ROOT/snip['path']).is_file(),snip['path'])
                self.assertGreaterEqual(snip['line'],1)
                self.assertTrue(snip['excerpt'])

    def test_theme_token_and_local_property_inventory_is_consistent(self):
        self.assertGreater(len(self.by_family['Button']['themeTokenRefs']),0)
        self.assertGreater(len(self.by_family['TextField']['themeTokenRefs']),0)
        self.assertFalse(self.by_family['Icon']['hasDedicatedFamilyStylesheet'])
        for f in self.ledger['families']:
            self.assertEqual(sorted(set(f['themeTokenRefs'])),f['themeTokenRefs'])
            self.assertEqual(sorted(set(f['localCustomProps'])),f['localCustomProps'])
            self.assertEqual([],f['unresolvedLocalProps'],f['family'])

    def test_family_styles_have_no_raw_color_literals_in_this_inventory(self):
        self.assertEqual(0,sum(len(f['rawColorDeclarations']) for f in self.ledger['families']))
        for f in self.ledger['families']:
            for raw in f['rawColorDeclarations']:
                self.assertTrue((ROOT/raw['path']).is_file(),raw['path'])

    def test_component_specific_forced_colors_and_motion_gaps_are_recorded(self):
        self.assertEqual(0,self.by_family['Button']['componentForcedColorsRuleLines'])
        self.assertEqual(0,self.by_family['Badge']['componentReducedMotionRuleLines'])
        self.assertIn('no component-specific reduced-motion rule',self.by_family['Badge']['sourceNote'])
        self.assertIn('forced-colors',self.report)
        self.assertIn('native OS high-contrast',self.report)

    def test_no_family_is_approved_by_token_inventory(self):
        self.assertFalse(self.ledger['parityAccepted'])
        self.assertTrue(self.ledger['noneApproved'])
        for f in self.ledger['families']:
            self.assertEqual('pending',f['designApproval'])
            self.assertIsNone(f['evidenceBundle'])

    def test_browser_evidence_files_exist(self):
        for f in self.ledger['families']:
            self.assertTrue(f['browserEvidence'],f['family'])
            for rel in f['browserEvidence']:
                self.assertTrue((QUALITY/rel).is_file(),rel)

    def test_missing_family_negative_control_fails_closed(self):
        saved=builder.STYLE_MAP.pop('Button')
        try:
            with self.assertRaisesRegex(ValueError,'exactly all 18 matrix families'):
                builder.build()
        finally:
            builder.STYLE_MAP['Button']=saved

    def test_checked_in_outputs_match_builder(self):
        self.assertEqual(self.ledger,json.loads((QUALITY/'FLUENT-PARITY-TOKEN-THEME-AUDIT.json').read_text(encoding='utf-8-sig')))
        self.assertEqual(self.report,(QUALITY/'FLUENT-PARITY-TOKEN-THEME-AUDIT.md').read_text(encoding='utf-8-sig'))


if __name__=='__main__':
    unittest.main()
