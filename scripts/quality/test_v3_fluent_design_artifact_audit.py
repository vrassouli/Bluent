"""Tests for the #552 Penpot design-artifact coverage audit."""
import json
import unittest
from pathlib import Path
from unittest.mock import patch

import build_v3_fluent_design_artifact_audit as builder

ROOT=Path(__file__).resolve().parents[2]
QUALITY=ROOT/'docs/v3/quality'
MATRIX=QUALITY/'FLUENT-PARITY-RETRO-AUDIT.json'


class DesignArtifactAuditTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.ledger,cls.report=builder.build()
        cls.by_family={f['family']:f for f in cls.ledger['families']}
        cls.matrix=json.loads(MATRIX.read_text(encoding='utf-8-sig'))
        cls.snapshot=json.loads(builder.SNAPSHOT.read_text(encoding='utf-8-sig'))

    def test_exact_18_family_coverage_and_matrix_dimension(self):
        self.assertEqual(18,self.ledger['familyCount'])
        self.assertEqual({f['family'] for f in self.matrix['families']},set(self.by_family))
        self.assertEqual('designArtifact',self.ledger['dimension'])
        self.assertEqual('audited_gaps',self.ledger['dimensionStatus'])
        for f in self.matrix['families']:
            self.assertEqual('audited_gaps',f['dimensions']['designArtifact'],f['family'])

    def test_live_penpot_snapshot_provenance_is_present(self):
        self.assertEqual('2026-10-22',self.snapshot['capturedOn'])
        addendum=json.loads((QUALITY/'evidence/PENPOT-ISSUE-552-DESIGN-ARTIFACT-ADDENDUM-2026-10-23.json').read_text(encoding='utf-8-sig'))
        self.assertEqual('2026-10-23',addendum['recordedOn'])
        self.assertEqual('Icon',addendum['family'])
        self.assertFalse(addendum['variantSetComplete'])
        self.assertEqual('pending',addendum['designApproval'])
        self.assertIsNone(addendum['evidenceBundle'])
        self.assertEqual('Bluent v3 Design System',self.ledger['penpotFile']['name'])
        self.assertEqual('b64f6665-c9ab-80b5-8008-c4ac99d9d000',self.ledger['penpotFile']['id'])
        self.assertEqual('4d22aead-d6ef-801a-8008-d482b9bb0cc8',self.ledger['coverageBoard']['id'])
        self.assertTrue((QUALITY/self.ledger['penpotSnapshot']).is_file())

    def test_coverage_board_is_not_design_approval(self):
        metrics=self.ledger['coverageBoard']['metrics']
        self.assertEqual(18,metrics['familyCount'])
        self.assertEqual('18 / 18',metrics['familiesWithLinkedPartialBrowserRuntimeEvidence'])
        self.assertEqual(239,metrics['sourceKnownApiEntries'])
        self.assertEqual('0 / 18',metrics['fluentApprovals'])
        self.assertIn('not a family design approval',self.ledger['runtimeScope'])

    def test_four_family_types_have_draft_assets_and_fourteen_do_not(self):
        self.assertEqual(5,self.ledger['familySpecificDesignAssetCount'])
        self.assertEqual(4,self.ledger['familySpecificReusableVariantSetCount'])
        self.assertEqual({'Button','TextField','Checkbox','Switch'},set(self.ledger['familySpecificReusableVariantSetFamilies']))
        self.assertEqual(13,self.ledger['familiesWithoutDedicatedFamilyAssetCount'])
        self.assertEqual({'Button','TextField','Checkbox','Switch','Icon'},set(self.ledger['familySpecificDesignAssets']))
        self.assertEqual(13,len(self.ledger['familiesWithoutDedicatedFamilyAsset']))
        icon=self.by_family['Icon']
        self.assertEqual('dedicated-review-board-incomplete-variant-coverage',icon['designArtifactStatus'])
        self.assertFalse(icon['designPages'][0]['variantSetComplete'])
        self.assertEqual(129,icon['designPages'][0]['editableChildren'])
        self.assertEqual(68,icon['designPages'][0]['textNodes'])
        self.assertEqual(0,icon['designPages'][0]['invalidTextBounds'])
        self.assertEqual(0,icon['designPages'][0]['childrenOutsideBoard'])
        for name in self.ledger['familySpecificDesignAssets']:
            expected='dedicated-review-board-incomplete-variant-coverage' if name=='Icon' else 'draft-family-artifacts-present'
            self.assertEqual(expected,self.by_family[name]['designArtifactStatus'])
            self.assertTrue(self.by_family[name]['designPages'])
        for name in self.ledger['familiesWithoutDedicatedFamilyAsset']:
            self.assertEqual('coverage-row-only-no-dedicated-family-asset-in-current-record',self.by_family[name]['designArtifactStatus'])
            self.assertEqual([],self.by_family[name]['designPages'])

    def test_family_specific_page_ids_are_grounded_in_snapshot(self):
        for f in self.ledger['families']:
            for page in f['designPages']:
                self.assertRegex(page['id'],r'^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$')
                self.assertTrue(page['name'])
        self.assertEqual(8,len(self.by_family['Button']['designPages']))
        self.assertEqual(1,len(self.by_family['Icon']['designPages']))
        self.assertEqual('1d7e9dd6-b977-802e-8008-d5a718e3f4a2',self.by_family['Icon']['designPages'][0]['boardId'])
        self.assertEqual(1,len(self.by_family['TextField']['designPages']))

    def test_all_family_coverage_rows_match_issue_matrix(self):
        for f in self.ledger['families']:
            self.assertEqual(f['family'],f['coverageRow']['family'])
            self.assertEqual(f['productIssue'],f['coverageRow']['productIssue'])
            self.assertTrue(f['coverageRow']['gap'])

    def test_all_approvals_remain_pending(self):
        self.assertFalse(self.ledger['parityAccepted'])
        self.assertTrue(self.ledger['noneApproved'])
        for f in self.ledger['families']:
            self.assertEqual('pending',f['designApproval'])
            self.assertIsNone(f['evidenceBundle'])

    def test_acceptance_requires_family_design_not_coverage_row(self):
        self.assertIn('family-specific editable artifact',self.ledger['acceptanceBoundary'])
        self.assertIn('13/18',self.report)
        self.assertIn('upstream Fluent reference pages',self.report)

    def test_missing_family_negative_control_fails_closed(self):
        original=builder.readj
        def altered(path):
            value=original(path)
            if path==builder.SNAPSHOT:
                value['coverageRows'].pop()
            return value
        with patch.object(builder,'readj',side_effect=altered):
            with self.assertRaisesRegex(ValueError,'exactly all 18 families'):
                builder.build()

    def test_checked_in_outputs_match_builder(self):
        self.assertEqual(self.ledger,json.loads((QUALITY/'FLUENT-PARITY-DESIGN-ARTIFACT-AUDIT.json').read_text(encoding='utf-8-sig')))
        self.assertEqual(self.report,(QUALITY/'FLUENT-PARITY-DESIGN-ARTIFACT-AUDIT.md').read_text(encoding='utf-8-sig'))


if __name__=='__main__':
    unittest.main()
