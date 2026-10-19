"""#552 P0 semantic/coordinate source checkpoint negative controls."""
import copy
import unittest

from audit_v3_p0_semantic_gaps import collect, snapshot_from, source_texts, validate


class P0SemanticGapTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.text = source_texts()
        cls.expected = snapshot_from(cls.text)

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
