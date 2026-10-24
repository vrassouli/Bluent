import json
import unittest
from pathlib import Path
import compare_v3_fluent_button_crops as pixel_diff

ROOT = Path(__file__).resolve().parents[2]
EVIDENCE = ROOT / "docs/v3/quality/evidence"

class FluentButtonPixelDiffEvidence(unittest.TestCase):
    def test_both_real_crop_pairs_are_exactly_96_by_32(self):
        for mode, names in pixel_diff.PAIR_NAMES.items():
            for name in names[:2]:
                width, height, _rgb, _digest = pixel_diff.decode_png_rgb(EVIDENCE / name)
                self.assertEqual((96, 32), (width, height), f"{mode}: {name}")

    def test_metrics_and_difference_images_recompute_deterministically(self):
        ledger, generated_images = pixel_diff.build()
        stored = json.loads(pixel_diff.JSON_OUT.read_text(encoding="utf-8-sig"))
        self.assertEqual(ledger, stored)
        self.assertEqual({names[2] for names in pixel_diff.PAIR_NAMES.values()}, set(generated_images))
        for mode in ("LIGHT-LTR", "DARK-RTL"):
            row = next(item for item in ledger["comparisons"] if item["mode"] == mode)
            self.assertGreater(row["changedPixels"], 0)
            self.assertEqual(row["totalPixels"], row["width"] * row["height"])
            diff_path = EVIDENCE / row["differenceImage"]
            self.assertEqual(generated_images[row["differenceImage"]], diff_path.read_bytes())
            self.assertEqual(row["differenceImageSHA256"], pixel_diff.sha256(diff_path.read_bytes()))

    def test_surface_color_and_foreground_mask_are_reported_separately(self):
        ledger, _images = pixel_diff.build()
        expected = {
            "LIGHT-LTR": ((15, 108, 189), (18, 103, 180), (3, 5, 9), 314, 383, 0.4431),
            "DARK-RTL": ((17, 94, 163), (24, 89, 155), (7, 5, 8), 333, 407, 0.4949),
        }
        for row in ledger["comparisons"]:
            official, bluent, delta, official_count, bluent_count, iou = expected[row["mode"]]
            self.assertEqual(list(official), row["surfaceColor"]["officialRGB"])
            self.assertEqual(list(bluent), row["surfaceColor"]["bluentRGB"])
            self.assertEqual(list(delta), row["surfaceColor"]["absoluteChannelDelta"])
            mask = row["foregroundMask"]
            self.assertEqual(official_count, mask["officialPixelCount"])
            self.assertEqual(bluent_count, mask["bluentPixelCount"])
            self.assertAlmostEqual(iou, mask["intersectionOverUnion"], places=4)
            self.assertTrue(mask["thresholdIsExploratoryNotAcceptance"])

    def test_live_computed_font_stack_explains_text_width_delta(self):
        typography = json.loads(pixel_diff.TYPOGRAPHY_JSON.read_text(encoding="utf-8-sig"))
        self.assertEqual("b9952aa93e89fd569de54080a7fdd06037b53a41", typography["bluent"]["sourceRef"])
        for mode, row in typography["modes"].items():
            official = row["official"]
            bluent = row["bluent"]
            self.assertIn("Segoe UI", official["computedStyle"]["fontFamily"])
            self.assertEqual("Tahoma", bluent["computedStyle"]["fontFamily"])
            self.assertTrue(row["comparison"]["fontFamilyDiffers"])
            for field in ("fontSize", "fontWeight", "lineHeight"):
                self.assertTrue(row["comparison"][f"{field}Matches"], (mode, field))
                self.assertEqual(official["computedStyle"][field], bluent["computedStyle"][field])
            self.assertTrue(row["comparison"]["horizontalPaddingMatches"])
            self.assertAlmostEqual(12.28, row["comparison"]["textRangeWidthDeltaCssPx"], places=2)
            for side in (official, bluent):
                crop = pixel_diff.EVIDENCE / side["file"]
                self.assertEqual(side["sha256"], pixel_diff.sha256(crop.read_bytes()))
        ledger, _ = pixel_diff.build()
        for metric in ledger["comparisons"]:
            self.assertTrue(metric["computedTypographyEvidence"]["fontFamilyDiffers"])
            self.assertEqual(12.28, metric["computedTypographyEvidence"]["textRectWidthCssPx"]["bluentMinusOfficial"])

    def test_report_is_explicitly_diagnostic_not_parity_acceptance(self):
        ledger, _images = pixel_diff.build()
        self.assertFalse(ledger["parityAccepted"])
        self.assertEqual("diagnostic_pixel_difference_not_parity_approval", ledger["status"])
        self.assertEqual("b9952aa93e89fd569de54080a7fdd06037b53a41", ledger["bluent"]["sourceRef"])
        self.assertEqual("@fluentui/web-components@3.1.3", ledger["reference"]["package"])
        self.assertTrue(any("not a perceptual quality score" in item for item in ledger["acceptanceLimitations"]))

if __name__ == "__main__":
    unittest.main()
