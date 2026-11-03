"""Contract tests for the #552 Wave D Fluent API mapping ledger."""
import json
import unittest
from pathlib import Path

import build_v3_fluent_wave_d_api_review as builder

ROOT = Path(__file__).resolve().parents[2]
QUALITY = ROOT / "docs/v3/quality"
EXPECTED_COUNTS = {"Slider": 13, "RangeSlider": 13, "FileSelect": 20}
ALLOWED = {"Supported", "Missing", "Bluent extension", "N/A"}


class WaveDApiReviewTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.ledger, cls.report = builder.build()
        cls.by_family = {x["family"]: x for x in cls.ledger["families"]}
        cls.candidates = json.loads(
            (QUALITY / "FLUENT-WC-3.1.3-18-API-NAME-CANDIDATES.json").read_text(encoding="utf-8-sig")
        )

    def get_parameter(self, family, component, name):
        return next(p for p in self.by_family[family]["parameters"] if p["component"] == component and p["name"] == name)

    def test_exact_three_family_coverage_and_46_parameter_occurrences(self):
        self.assertEqual(tuple(EXPECTED_COUNTS), tuple(x["family"] for x in self.ledger["families"]))
        self.assertEqual(46, self.ledger["parameterOccurrenceCount"])
        self.assertEqual(EXPECTED_COUNTS, {k: v["parameterCount"] for k, v in self.by_family.items()})
        declared = [p for f in self.ledger["families"] for p in f["parameters"] if p["origin"] != "local_inherited"]
        inherited = [p for f in self.ledger["families"] for p in f["parameters"] if p["origin"] == "local_inherited"]
        self.assertEqual(22, len(declared))
        self.assertEqual(24, len(inherited))

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
        self.assertEqual(46, len(expected))
        self.assertEqual(expected, actual)
        for family in self.ledger["families"]:
            self.assertEqual(family["parameterCount"], family["reviewedParameterCount"])
            for parameter in family["parameters"]:
                self.assertIn(parameter["reviewDisposition"], ALLOWED)
                self.assertTrue(parameter["mapping"])
                self.assertTrue(parameter["rationale"])
                self.assertTrue(parameter["sourceFile"])
                self.assertEqual("not_reviewed", parameter["sourceCandidateStatus"])

    def test_single_slider_and_two_thumb_range_are_not_conflated(self):
        slider = self.by_family["Slider"]
        range_slider = self.by_family["RangeSlider"]
        self.assertEqual({"fluent-slider"}, set(slider["referencedTags"]))
        self.assertEqual({"fluent-slider"}, {x["tag"] for x in range_slider["relatedUpstreamContracts"]})
        self.assertEqual(set(), set(range_slider["referencedTags"]))
        self.assertEqual("Supported", self.get_parameter("Slider", "Slider", "Value")["reviewDisposition"])
        self.assertEqual("Bluent extension", self.get_parameter("RangeSlider", "RangeSlider", "Value")["reviewDisposition"])
        self.assertEqual("Bluent extension", self.get_parameter("Slider", "Slider", "ThumbSize")["reviewDisposition"])
        self.assertIn("no dedicated one-to-one WC tag", self.report)
        self.assertIn("without native slider role", self.report)

    def test_file_select_subcontrol_and_limit_gaps_are_explicit(self):
        file_select = self.by_family["FileSelect"]
        self.assertEqual(set(), set(file_select["referencedTags"]))
        self.assertEqual({"fluent-button"}, {x["tag"] for x in file_select["relatedUpstreamContracts"]})
        self.assertEqual("Supported", self.get_parameter("FileSelect", "FileSelect", "Accept")["reviewDisposition"])
        self.assertIn("server-side", self.get_parameter("FileSelect", "FileSelect", "Accept")["followUp"])
        self.assertEqual("Bluent extension", self.get_parameter("FileSelect", "FileSelect", "MaxFiles")["reviewDisposition"])
        self.assertIn("MaxFiles=2", self.get_parameter("FileSelect", "FileSelect", "MaxFiles")["rationale"])
        self.assertIn("enforce batch and cumulative limits", self.get_parameter("FileSelect", "FileSelect", "MaxFiles")["followUp"])
        self.assertIn("hidden InputFile", self.get_parameter("FileSelect", "FileSelect", "Disabled")["rationale"])

    def test_no_family_is_approved_by_an_api_mapping(self):
        self.assertFalse(self.ledger["parityAccepted"])
        for family in self.ledger["families"]:
            self.assertEqual("audited_gaps", family["apiReviewStatus"])
            self.assertEqual("pending", family["designApproval"])
            self.assertIsNone(family["evidenceBundle"])
        self.assertIn("InputBase<TValue>", self.ledger["outOfBandPublicApi"][0]["scope"])
        self.assertIn("not parity-approved", self.report)
        self.assertIn("does not enforce remaining batch capacity", self.report)

    def test_missing_disposition_negative_control_fails_closed(self):
        removed = builder.D["Slider"].pop("ThumbSize")
        try:
            with self.assertRaisesRegex(ValueError, "Missing disposition: Slider.Slider.ThumbSize"):
                builder.build()
        finally:
            builder.D["Slider"]["ThumbSize"] = removed

    def test_checked_in_outputs_match_reproducible_builder(self):
        self.assertEqual(
            self.ledger,
            json.loads((QUALITY / "FLUENT-PARITY-WAVE-D-API-REVIEW.json").read_text(encoding="utf-8-sig")),
        )
        self.assertEqual(self.report, (QUALITY / "FLUENT-PARITY-WAVE-D-API-REVIEW.md").read_text(encoding="utf-8-sig"))


if __name__ == "__main__":
    unittest.main()
