"""#552 browser-backed FileSelect upload and accessible name evidence.

Source snapshot assertions intentionally confirm existing gaps. They must fail
when the product is fixed until the evidence is recaptured/re-reviewed.
"""
import json
import unittest
from pathlib import Path

ROOT=Path(__file__).resolve().parents[2]
EVIDENCE=ROOT/"docs/v3/quality/evidence"
REC=EVIDENCE/"BLUENT-LAB-P0-FILE-UPLOAD-CHROME.json"


class FileSelectRealUploadEvidence(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.data=json.loads(REC.read_text(encoding="utf-8"))
        cls.file=next(x for x in cls.data["measurements"] if x["family"]=="FileSelect")
        cls.upload=cls.file["uploadEvidence"]
        cls.steps={x["name"]:x for x in cls.upload["stages"]}

    def test_lab_source_and_real_browser_provenance(self):
        self.assertEqual(552,self.data["auditIssue"])
        self.assertEqual("v3/issue-421-component-lab",self.data["sourceBranch"])
        self.assertEqual("b9952aa93e89fd569de54080a7fdd06037b53a41",self.data["sourceRef"])
        self.assertEqual("file-upload",self.data["scenario"])
        self.assertEqual(2,self.upload["testedMaxFiles"])
        self.assertIn("DOM.setFileInputFiles",self.upload["limitations"])

    def test_recorded_browser_assertions(self):
        self.assertEqual(16,len(self.data["checks"]))
        self.assertTrue(all(x["pass"] for x in self.data["checks"]))
        self.assertEqual({"initial","single-first","single-replaced","multi-two",
                          "after-remove","cumulative-overflow"},set(self.steps))

    def test_real_single_file_change_replaces_earlier_file(self):
        self.assertIn("Files: 1;",self.steps["single-first"]["statusSingle"])
        self.assertIn("alpha.txt",self.steps["single-first"]["statusSingle"])
        self.assertIn("single-replacement.txt",self.steps["single-replaced"]["statusSingle"])
        self.assertNotIn("alpha.txt",self.steps["single-replaced"]["statusSingle"])

    def test_max_files_button_hides_but_does_not_enforce_batch_limit(self):
        two=self.steps["multi-two"]
        overflow=self.steps["cumulative-overflow"]
        self.assertEqual(2,two["multi"]["cardCount"])
        self.assertFalse(two["multi"]["chooseVisible"])
        self.assertIn("Files: 2;",two["statusMulti"])
        self.assertEqual(3,overflow["multi"]["cardCount"])
        self.assertEqual(3,len(overflow["multi"]["removeButtons"]))
        self.assertIn("Files: 3;",overflow["statusMulti"])
        self.assertFalse(overflow["multi"]["chooseVisible"])

    def test_remove_and_reselect_path_is_real(self):
        after=self.steps["after-remove"]
        self.assertEqual(1,after["multi"]["cardCount"])
        self.assertTrue(after["multi"]["chooseVisible"])
        self.assertIn("beta.md",after["statusMulti"])
        self.assertIn("gamma.txt",self.steps["cumulative-overflow"]["statusMulti"])
        self.assertIn("delta.md",self.steps["cumulative-overflow"]["statusMulti"])

    def test_accessible_name_is_private_use_font_glyph_not_text(self):
        ax=self.upload["removeAX"]
        buttons=[x for x in ax if x["role"]=="button" and not x["ignored"]]
        self.assertEqual(1,len(buttons))
        self.assertTrue(buttons[0]["name"])
        self.assertTrue(all(0xE000 <= ord(c) <= 0xF8FF for c in buttons[0]["name"]))
        for entry in self.steps["multi-two"]["multi"]["removeButtons"]:
            self.assertIsNone(entry["ariaLabel"])
            self.assertIsNone(entry["title"])

    def test_native_accept_hint_and_disabled_button(self):
        initial=self.steps["initial"]
        self.assertFalse(initial["single"]["multiple"])
        self.assertTrue(initial["multi"]["multiple"])
        self.assertEqual(".txt",initial["single"]["accept"])
        self.assertEqual(".txt,.md",initial["multi"]["accept"])
        self.assertTrue(initial["disabledButton"])

    def test_original_source_contains_unbounded_append_and_icon_only_action(self):
        razor=(ROOT/"src/Bluent.UI/Components/FileSelectComponent/FileSelect.razor").read_text(encoding="utf-8-sig")
        code=(ROOT/"src/Bluent.UI/Components/FileSelectComponent/FileSelect.razor.cs").read_text(encoding="utf-8-sig")
        self.assertIn("_files.Count < MaxFiles",razor)
        self.assertIn("GetMultipleFiles(args.FileCount)",code)
        self.assertIn("_files.Add(file)",code)
        self.assertIn("Icon=\"@FluentIcons.Delete\"",razor)
        self.assertNotIn("aria-label",razor)

    def test_actual_screenshot_and_no_false_release_approval(self):
        path=EVIDENCE/"BLUENT-LAB-FILESELECT-FILE-UPLOAD-CHROME.png"
        self.assertGreater(path.stat().st_size,2000)
        self.assertEqual(b"\x89PNG\r\n\x1a\n",path.read_bytes()[:8])
        self.assertIn("NOT_fluent_parity",self.data["status"])
        self.assertNotIn("nativeOsAtApproved",self.data)
        self.assertNotIn("componentApproved",self.data)
        self.assertNotIn("serverSideFileValidationTested",self.data)


if __name__=="__main__":
    unittest.main()
