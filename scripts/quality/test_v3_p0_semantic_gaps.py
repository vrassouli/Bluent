"""#552 P0 semantic/coordinate source checkpoint negative controls."""
import copy
import unittest

from audit_v3_p0_semantic_gaps import collect, snapshot_from, source_texts, validate


class P0SemanticGapTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.text = source_texts()
        cls.expected = snapshot_from(cls.text)

    def test_maintainer_approved_defaults_are_traceable_without_claiming_gap_closure(self):
        from pathlib import Path
        root = Path(__file__).resolve().parents[2]
        triage = (root/"docs/v3/quality/FLUENT-PARITY-P0-TRIAGE.md").read_text(encoding="utf-8-sig")
        queue = (root/"docs/v3/quality/FLUENT-PARITY-P0-REMEDIATION-QUEUE.md").read_text(encoding="utf-8-sig")
        project = (root/".bluent/PROJECT.md").read_text(encoding="utf-8-sig")
        for phrase in (
            "Maintainer-approved default policy crosswalk: 2026-10-25",
            'generate aria-pressed="true" / "false" only when Toggled.HasValue',
            "reject the entire batch, preserve previously accepted files",
            "PointerEventArgs.ClientX with the matching getBoundingClientRect().Left",
            "stable non-crossing endpoints",
            "Exact token mappings",
            "board 1d92b6fb-c168-8047-8008-d7d1f38c5d2f",
            "REVIEW REQUIRED",
            "do **not** erase any of the seven current source observations",
            "Explicit caller aria-pressed precedence remains unresolved",
            "MaxFiles <= 0",
            "Native OS/assistive-technology acceptance",
        ):
            with self.subTest(phrase=phrase):
                self.assertIn(phrase, triage)
        self.assertIn("Approved behavioral baseline from #420 (2026-10-25)", queue)
        self.assertIn("The #552 source-gap JSON remains unchanged", queue)
        self.assertIn("Latest #552 P0 decision crosswalk (2026-10-25)", project)
        self.assertIn("The FLUENT-PARITY-P0-SEMANTICS.json seven-observation source checkpoint is intentionally unchanged", project)
        self.assertIn("#552 stays In progress and PR #553 Draft", project)

    def test_seven_source_observations_are_present(self):
        self.assertEqual(7, len(self.expected["checks"]))
        self.assertTrue(all(c["observedSourceGap"] for c in self.expected["checks"]))

    def test_slider_coordinate_fix_requires_reaudit(self):
        mutated = dict(self.text)
        mutated["slider_code"] = mutated["slider_code"].replace("args.ScreenX", "args.ClientX")
        self.assertFalse(next(c for c in collect(mutated) if c["id"]=="pointer_coordinate_space" and c["family"]=="Slider")["observedSourceGap"])

    def test_range_thumb_semantic_remediation_requires_reaudit(self):
        mutated = dict(self.text)
        mutated["range_markup"] = mutated["range_markup"].replace('class="thumb min-thumb"', 'class="thumb min-thumb" role="slider"')
        self.assertFalse(next(c for c in collect(mutated) if c["id"]=="two_thumb_semantics")["observedSourceGap"])

    def test_false_fluent_approval_fails(self):
        bad = copy.deepcopy(self.expected)
        bad["fluentAcceptance"] = True
        self.assertTrue(validate(bad, self.expected))

    def test_false_observation_removal_fails(self):
        bad = copy.deepcopy(self.expected)
        bad["checks"][0]["observedSourceGap"] = False
        self.assertTrue(validate(bad, self.expected))

    def test_file_remove_label_fix_requires_reaudit(self):
        mutated = dict(self.text)
        mutated["file_markup"] = mutated["file_markup"].replace(
            '<Button Icon="@FluentIcons.Delete"',
            '<Button Icon="@FluentIcons.Delete" aria-label="Remove selected file"')
        self.assertFalse(next(c for c in collect(mutated) if c["id"]=="remove_action_accessible_name")["observedSourceGap"])


if __name__ == "__main__":
    unittest.main()
