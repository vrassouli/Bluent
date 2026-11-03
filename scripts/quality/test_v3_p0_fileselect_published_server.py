"""#552 real Production-published InteractiveServer FileSelect upload evidence.

These checks deliberately confirm *current defects*, not remediations,
production upload security, native OS picker behavior or Fluent parity.
"""
import json
import unittest
from pathlib import Path

ROOT=Path(__file__).resolve().parents[2]
EVIDENCE=ROOT/"docs/v3/quality/evidence"


def load(mode):
    suffix="-SERVER" if mode=="Server" else ""
    return json.loads((EVIDENCE/f"BLUENT-LAB-P0-FILE-UPLOAD{suffix}-CHROME.json").read_text(encoding="utf-8"))


class PublishedServerFileSelectAudit(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.s=load("Server")
        cls.w=load("WebAssembly")
        cls.sm=next(x for x in cls.s["measurements"] if x["family"]=="FileSelect")["uploadEvidence"]
        cls.wm=next(x for x in cls.w["measurements"] if x["family"]=="FileSelect")["uploadEvidence"]

    def test_is_actually_published_interactive_server_not_debug_wasm(self):
        self.assertEqual("Server",self.s["hostingMode"])
        self.assertIn("published Production Blazor InteractiveServer",self.s["mode"])
        self.assertEqual("WebAssembly",self.w["hostingMode"])
        self.assertEqual("b9952aa93e89fd569de54080a7fdd06037b53a41",self.s["sourceRef"])
        self.assertEqual(552,self.s["auditIssue"])
        self.assertEqual({"FileSelect"}, {x["family"] for x in self.s["measurements"]})

    def test_both_real_runtime_checkpoints_pass_but_not_product_parity(self):
        self.assertEqual(12,len(self.s["checks"]))
        self.assertEqual(17,len(self.w["checks"]))
        self.assertTrue(all(x["pass"] for x in self.s["checks"]))
        self.assertTrue(all(x["pass"] for x in self.w["checks"]))
        self.assertIn("NOT_fluent_parity",self.s["status"])

    def test_cumulative_reselect_overflow_reproduced_on_both_modes(self):
        for upload in (self.sm,self.wm):
            stages={x["name"]:x for x in upload["stages"]}
            self.assertEqual(2,stages["multi-two"]["multi"]["cardCount"])
            self.assertEqual(1,stages["after-remove"]["multi"]["cardCount"])
            self.assertEqual(3,stages["cumulative-overflow"]["multi"]["cardCount"])
            self.assertIn("beta.md, gamma.txt, delta.md",stages["cumulative-overflow"]["statusMulti"])

    def test_one_batch_exceeding_maxfiles_reproduces_in_both_modes(self):
        for upload in (self.sm,self.wm):
            batch=upload["singleBatchOverflow"]
            self.assertEqual(2,batch["maxFiles"])
            self.assertEqual(3,batch["cards"])
            self.assertIn("Files: 3;",batch["status"])
            self.assertEqual(3,batch["removeButtons"])

    def test_remove_ax_glyph_still_not_meaningful_in_both_modes(self):
        for upload in (self.sm,self.wm):
            button=next(x for x in upload["removeAX"] if x["role"]=="button" and not x["ignored"])
            self.assertTrue(button["name"])
            self.assertTrue(all(0xE000<=ord(c)<=0xF8FF for c in button["name"]))

    def test_server_images_have_real_png_signature(self):
        for name in ("BLUENT-LAB-FILESELECT-FILE-UPLOAD-SERVER-CHROME.png",
                     "BLUENT-LAB-FILESELECT-ONE-BATCH-SERVER-CHROME.png"):
            path=EVIDENCE/name
            self.assertGreater(path.stat().st_size,2000)
            self.assertEqual(b"\x89PNG\r\n\x1a\n",path.read_bytes()[:8])

    def test_no_native_os_approval_and_local_publish_runner_isolation(self):
        for record in (self.s,self.w):
            self.assertNotIn("nativeOsAtApproved",record)
            self.assertNotIn("serverSecurityValidated",record)
        ps=(ROOT/"scripts/quality/run_v3_fileselect_published_server.ps1").read_text(encoding="utf-8")
        self.assertIn("dotnet publish",ps)
        self.assertIn("Release",ps)
        self.assertIn("BLUENT_V3_552_PUBLISHED_DIR",ps)
        self.assertIn("Remove-Item -LiteralPath $published",ps)


if __name__=="__main__":
    unittest.main()
