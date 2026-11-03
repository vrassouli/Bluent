"""Contract tests for the #552 Wave C Fluent API mapping ledger."""
import json
import unittest
from pathlib import Path

import build_v3_fluent_wave_c_api_review as builder

ROOT = Path(__file__).resolve().parents[2]
QUALITY = ROOT / "docs/v3/quality"
EXPECTED_COUNTS = {"DateField": 13, "TimeField": 9, "MaskedField": 9, "OtpField": 9}
ALLOWED = {"Supported", "Missing", "Bluent extension", "N/A"}


class WaveCApiReviewTests(unittest.TestCase):
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

    def test_exact_four_family_coverage_and_40_parameter_occurrences(self):
        self.assertEqual(tuple(EXPECTED_COUNTS), tuple(x["family"] for x in self.ledger["families"]))
        self.assertEqual(40, self.ledger["parameterOccurrenceCount"])
        self.assertEqual(EXPECTED_COUNTS, {k: v["parameterCount"] for k, v in self.by_family.items()})
        declared = [p for f in self.ledger["families"] for p in f["parameters"] if p["origin"] != "local_inherited"]
        inherited = [p for f in self.ledger["families"] for p in f["parameters"] if p["origin"] == "local_inherited"]
        self.assertEqual(16, len(declared))
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
        self.assertEqual(40, len(expected))
        self.assertEqual(expected, actual)
        for family in self.ledger["families"]:
            self.assertEqual(family["parameterCount"], family["reviewedParameterCount"])
            for parameter in family["parameters"]:
                self.assertIn(parameter["reviewDisposition"], ALLOWED)
                self.assertTrue(parameter["mapping"])
                self.assertTrue(parameter["rationale"])
                self.assertTrue(parameter["sourceFile"])
                self.assertEqual("not_reviewed", parameter["sourceCandidateStatus"])

    def test_source_confirmed_noops_are_explicit(self):
        self.assertEqual("Missing", self.get_parameter("DateField", "DateField", "DateClass")["reviewDisposition"])
        self.assertEqual("Missing", self.get_parameter("DateField", "DateField", "BindValueEvent")["reviewDisposition"])
        self.assertEqual("Missing", self.get_parameter("TimeField", "TimeField", "BindValueEvent")["reviewDisposition"])
        self.assertEqual("Missing", self.get_parameter("MaskedField", "MaskedField", "BindValueEvent")["reviewDisposition"])
        for name in ("StartAddon", "EndAddon", "Size"):
            with self.subTest(parameter=name):
                self.assertEqual("Missing", self.get_parameter("OtpField", "OtpField", name)["reviewDisposition"])

    def test_mask_regression_is_linked_to_real_browser_evidence(self):
        mask = self.get_parameter("MaskedField", "MaskedField", "Mask")
        self.assertEqual("Bluent extension", mask["reviewDisposition"])
        self.assertIn("0991-234-5678", mask["rationale"])
        self.assertIn("Chrome and Edge", mask["rationale"])
        self.assertIn("typed-entry", mask["followUp"])
        self.assertIn("YearSelect", self.get_parameter("DateField", "DateField", "Mode")["rationale"])
        self.assertIn("does not enforce", self.get_parameter("DateField", "DateField", "Min")["rationale"])
        self.assertIn("current culture", self.get_parameter("TimeField", "TimeField", "Culture")["rationale"])

    def test_otp_auto_submit_is_source_mapped_but_not_runtime_accepted(self):
        item = self.get_parameter("OtpField", "OtpField", "AutoSubmit")
        self.assertEqual("Bluent extension", item["reviewDisposition"])
        self.assertIn("requestSubmit/submit", item["rationale"])
        self.assertIn("real form fixture", item["followUp"])
        self.assertFalse(self.ledger["parityAccepted"])

    def test_pinned_upstream_contracts_are_retained(self):
        for family in self.ledger["families"]:
            with self.subTest(family=family["family"]):
                self.assertEqual({"fluent-text-input"}, set(family["referencedTags"]))
                self.assertEqual("related_only", family["counterpartKind"])
                self.assertEqual(["fluent-text-input"], [x["tag"] for x in family["upstreamContracts"]])

    def test_no_family_is_approved_by_an_api_mapping(self):
        self.assertFalse(self.ledger["parityAccepted"])
        for family in self.ledger["families"]:
            self.assertEqual("audited_gaps", family["apiReviewStatus"])
            self.assertEqual("pending", family["designApproval"])
            self.assertIsNone(family["evidenceBundle"])
        self.assertIn("InputBase<TValue>", self.ledger["outOfBandPublicApi"][0]["scope"])
        self.assertIn("not parity-approved", self.report)
        self.assertIn("native AT/form acceptance remains open", self.report)

    def test_missing_disposition_negative_control_fails_closed(self):
        removed = builder.D["DateField"].pop("DateClass")
        try:
            with self.assertRaisesRegex(ValueError, "Missing disposition: DateField.DateField.DateClass"):
                builder.build()
        finally:
            builder.D["DateField"]["DateClass"] = removed

    def test_checked_in_outputs_match_reproducible_builder(self):
        self.assertEqual(
            self.ledger,
            json.loads((QUALITY / "FLUENT-PARITY-WAVE-C-API-REVIEW.json").read_text(encoding="utf-8-sig")),
        )
        self.assertEqual(self.report, (QUALITY / "FLUENT-PARITY-WAVE-C-API-REVIEW.md").read_text(encoding="utf-8-sig"))


if __name__ == "__main__":
    unittest.main()
