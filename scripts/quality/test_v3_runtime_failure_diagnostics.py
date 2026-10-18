"""Fail-closed source guards for intermittent real Blazor/CDP diagnostic failures.

These prevent hiding the failures behind retries or truncating the original
host crash before any subsequent native OS review.
"""
from pathlib import Path
import unittest

ROOT=Path(__file__).resolve().parents[2]
PROBE=ROOT/"scripts/quality/probe_v3_blazor_runtime.mjs"

class BrowserFailureDiagnosticsContract(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.source=PROBE.read_text(encoding="utf-8-sig")

    def test_server_crash_retains_host_exit_and_bounded_tail(self):
        for part in (
            ".slice(-16000)", 'p.exitReason=null',
            'p.on("exit",(code,signal)', 'exitCode:app.exitCode',
            'signalCode:app.signalCode', 'exitReason:app.exitReason',
            "Bluent QA host diagnostics:"
        ):
            self.assertIn(part,self.source)

    def test_dialog_focus_failure_has_real_dom_snapshot_without_retry(self):
        for part in (
            "Dialog focus restoration after close",
            "targetConnected:target?.isConnected",
            "targetDisabled:target?.disabled",
            "activeId:active?.id",
            "dialogs:wrappers.map(",
            "throw Error(String(focusError)",
        ):
            self.assertIn(part,self.source)
        self.assertNotIn("focusReturned=true;",self.source)

    def test_failures_still_set_nonzero_exit_and_owned_browser_cleanup(self):
        self.assertIn('console.error("Probe error: "',self.source)
        self.assertIn("process.exitCode=1;",self.source)
        self.assertIn("await cleanupOwnedBrowser()",self.source)
        self.assertIn("Owned temporary QA browser cleanup failed",self.source)


if __name__=="__main__":
    unittest.main()