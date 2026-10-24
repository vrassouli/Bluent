"""Contract tests for the #552 Wave B Fluent API mapping ledger."""
import json
import unittest
from pathlib import Path

import build_v3_fluent_wave_b_api_review as builder

ROOT = Path(__file__).resolve().parents[2]
QUALITY = ROOT / "docs/v3/quality"
EXPECTED_COUNTS = {
    "TextField": 12,
    "NumericField": 17,
    "Checkbox": 9,
    "Switch": 9,
    "RadioGroup": 17,
    "SelectField": 7,
}
ALLOWED = {"Supported", "Missing", "Bluent extension", "N/A"}


class WaveBApiReviewTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.ledger, cls.report = builder.build()
        cls.by_family = {x["family"]: x for x in cls.ledger["families"]}
        cls.candidates = json.loads(
            (QUALITY / "FLUENT-WC-3.1.3-18-API-NAME-CANDIDATES.json").read_text(encoding="utf-8-sig")
        )

    def get_parameter(self, family, component, name):
        entries = self.by_family[family]["parameters"]
        return next(x for x in entries if x["component"] == component and x["name"] == name)

    def test_exact_six_family_coverage_and_71_parameter_occurrences(self):
        self.assertEqual(tuple(EXPECTED_COUNTS), tuple(x["family"] for x in self.ledger["families"]))
        self.assertEqual(71, self.ledger["parameterOccurrenceCount"])
        self.assertEqual(EXPECTED_COUNTS, {k: v["parameterCount"] for k, v in self.by_family.items()})
        self.assertEqual(71, sum(len(x["parameters"]) for x in self.ledger["families"]))
        declared = [p for f in self.ledger["families"] for p in f["parameters"] if p["origin"] != "local_inherited"]
        inherited = [p for f in self.ledger["families"] for p in f["parameters"] if p["origin"] == "local_inherited"]
        self.assertEqual(32, len(declared))
        self.assertEqual(39, len(inherited))

    def test_every_source_candidate_occurrence_is_classified_once(self):
        wave = set(EXPECTED_COUNTS)
        expected = {
            (f["family"], c["name"], p["name"])
            for f in self.candidates["families"] if f["family"] in wave
            for c in f["components"] for p in c["parameters"]
        }
        actual = {
            (f["family"], p["component"], p["name"])
            for f in self.ledger["families"] for p in f["parameters"]
        }
        self.assertEqual(71, len(expected))
        self.assertEqual(expected, actual)
        for family in self.ledger["families"]:
            self.assertEqual(family["parameterCount"], family["reviewedParameterCount"])
            for parameter in family["parameters"]:
                self.assertIn(parameter["reviewDisposition"], ALLOWED)
                self.assertTrue(parameter["mapping"])
                self.assertTrue(parameter["rationale"])
                self.assertTrue(parameter["sourceFile"])
                self.assertEqual("not_reviewed", parameter["sourceCandidateStatus"])

    def test_source_confirmed_gaps_are_explicit(self):
        self.assertEqual("Missing", self.get_parameter("NumericField", "NumericField", "Step")["reviewDisposition"])
        self.assertEqual("Missing", self.get_parameter("Switch", "Switch", "Circular")["reviewDisposition"])
        self.assertEqual("Missing", self.get_parameter("Switch", "Switch", "Size")["reviewDisposition"])
        self.assertEqual("N/A", self.get_parameter("Switch", "Switch", "IndeterminateLabel")["reviewDisposition"])
        self.assertEqual("Missing", self.get_parameter("SelectField", "SelectField", "BindValueEvent")["reviewDisposition"])

    def test_radio_component_specific_duplicate_names_are_disambiguated(self):
        family = self.by_family["RadioGroup"]
        labels = [p for p in family["parameters"] if p["name"] == "Label"]
        self.assertEqual({"RadioGroup", "Radio"}, {p["component"] for p in labels})
        self.assertTrue(all(p["reviewDisposition"] == "Bluent extension" for p in labels))
        child_context = self.get_parameter("RadioGroup", "Radio", "RadioGroup")
        self.assertEqual("Bluent extension", child_context["reviewDisposition"])
        self.assertEqual("cascading", child_context["kind"])

    def test_pinned_upstream_contracts_are_retained(self):
        expected_tags = {
            "TextField": {"fluent-text-input"},
            "NumericField": {"fluent-text-input"},
            "Checkbox": {"fluent-checkbox"},
            "Switch": {"fluent-switch"},
            "RadioGroup": {"fluent-radio-group", "fluent-radio"},
            "SelectField": {"fluent-dropdown", "fluent-dropdown-option", "fluent-listbox"},
        }
        for name, tags in expected_tags.items():
            with self.subTest(family=name):
                self.assertEqual(tags, set(self.by_family[name]["referencedTags"]))
                self.assertTrue(self.by_family[name]["upstreamContracts"])

    def test_no_family_is_approved_by_an_api_mapping(self):
        self.assertFalse(self.ledger["parityAccepted"])
        for family in self.ledger["families"]:
            self.assertEqual("audited_gaps", family["apiReviewStatus"])
            self.assertEqual("pending", family["designApproval"])
            self.assertIsNone(family["evidenceBundle"])
        self.assertIn("InputBase<TValue>", self.ledger["outOfBandPublicApi"][0]["scope"])
        self.assertIn("not parity-approved", self.report)
        self.assertIn("native screen-reader", self.report)

    def test_missing_disposition_negative_control_fails_closed(self):
        removed = builder.D["TextField"].pop("Rows")
        try:
            with self.assertRaisesRegex(ValueError, "Missing disposition: TextField.TextField.Rows"):
                builder.build()
        finally:
            builder.D["TextField"]["Rows"] = removed

    def test_checked_in_outputs_match_reproducible_builder(self):
        self.assertEqual(
            self.ledger,
            json.loads((QUALITY / "FLUENT-PARITY-WAVE-B-API-REVIEW.json").read_text(encoding="utf-8-sig")),
        )
        self.assertEqual(self.report, (QUALITY / "FLUENT-PARITY-WAVE-B-API-REVIEW.md").read_text(encoding="utf-8-sig"))


if __name__ == "__main__":
    unittest.main()
