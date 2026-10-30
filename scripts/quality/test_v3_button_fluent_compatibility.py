import re
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
REPORT = ROOT / "docs/v3/quality/FLUENT2-BUTTON-COMPATIBILITY.md"


def public_component_members(path: Path) -> list[str]:
    source = path.read_text(encoding="utf-8-sig")
    return re.findall(
        r"\[(?:Parameter|CascadingParameter)(?:\([^\]]*\))?\]\s*public\s+.+?\s+(\w+)\s*\{",
        source,
        re.MULTILINE,
    )


class ButtonFluentCompatibilityTests(unittest.TestCase):
    def setUp(self) -> None:
        self.report = REPORT.read_text(encoding="utf-8-sig")
        self.matrix = self.report.split("## Public API crosswalk", 1)[1].split(
            "### Important behavioral decisions", 1
        )[0]
        self.mapped_members = re.findall(
            r"^\|\s*([A-Za-z]\w*)\s*\|", self.matrix, re.MULTILINE
        )

    def test_crosswalk_covers_every_public_component_member(self) -> None:
        source_members: list[str] = []
        for relative in (
            "src/Bluent.UI/Components/ButtonComponent/Button.razor.cs",
            "src/Bluent.UI/Components/BluentUiComponentBase.cs",
            "src/Bluent.Core/BluentComponentBase.cs",
        ):
            source_members.extend(public_component_members(ROOT / relative))

        self.assertEqual(30, len(source_members))
        self.assertEqual(30, len(self.mapped_members))
        self.assertEqual(len(set(source_members)), len(source_members))
        self.assertEqual(len(set(self.mapped_members)), len(self.mapped_members))
        self.assertEqual(set(source_members), set(self.mapped_members))

    def test_toggle_claim_is_boolean_only_and_matches_source(self) -> None:
        button_source = (
            ROOT / "src/Bluent.UI/Components/ButtonComponent/Button.razor"
        ).read_text(encoding="utf-8-sig")
        self.assertIn('aria-pressed', button_source)
        self.assertIn("Toggled.HasValue", (
            ROOT / "src/Bluent.UI/Components/ButtonComponent/Button.razor.cs"
        ).read_text(encoding="utf-8-sig"))
        self.assertIn("boolean subset", self.report)
        self.assertIn('no Mixed/aria-pressed=mixed state', self.report)
        self.assertIn("Toggled=null", self.report)

    def test_reference_versions_and_brand_divergence_are_explicit(self) -> None:
        self.assertIn("@fluentui/web-components 3.1.3", self.report)
        self.assertIn("@fluentui/react-components 9.74.10", self.report)
        self.assertIn("#0F6CBD", self.report)
        self.assertIn("#1267B4", self.report)
        self.assertIn("#115EA3", self.report)
        self.assertIn("#18599B", self.report)
        self.assertIn("Do not claim exact pixel/color parity.", self.report)

    def test_native_windows_and_spoken_screen_reader_evidence_are_separated(self) -> None:
        self.assertIn("Native Windows Contrast Theme", self.report)
        self.assertIn("spoken Narrator announcement", self.report)
        self.assertIn("maintainer's final visual approval", self.report)


if __name__ == "__main__":
    unittest.main()