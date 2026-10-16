"""Explicit negative controls proving v3 quality policy fails closed."""
from __future__ import annotations
import unittest
from check_v3_quality_gate_contract import QUALITY,DOCUMENT,SSR_PROJ,BROWSERS,BROWSER_PROBE,COMPAT_LAYOUT,COMPAT_PROBE,check,check_server_patch,check_browser_contract,check_compatibility_host_theme,check_compatibility_probe_text,QualityContractError

class V3QualityContractTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.quality=QUALITY.read_text(encoding="utf-8-sig")
        cls.document=DOCUMENT.read_text(encoding="utf-8-sig")

    def test_actual_contract_passes(self):
        check(self.quality,self.document)

    def test_no_path_filtered_v3_quality_job(self):
        changed=self.quality.replace("branches: [bluent-v3]",
                        "branches: [bluent-v3]\n    paths: [docs/**]",1)
        with self.assertRaisesRegex(QualityContractError,"silently skip"):
            check(changed,self.document)

    def test_not_stable_branch(self):
        with self.assertRaisesRegex(QualityContractError,"isolated v3"):
            check(self.quality.replace("branches: [bluent-v3]","branches: [Dev]",1),self.document)

    def test_no_missing_pack_report(self):
        with self.assertRaisesRegex(QualityContractError,"pack version"):
            check(self.quality.replace("artifacts/v3-evidence/package-validation.json","artifacts/unknown.json"),self.document)

    def test_no_fake_ssr_smoke(self):
        changed=self.quality.replace("check_rendered_accessibility.py","echo successful")
        with self.assertRaisesRegex(QualityContractError,"real rendered SSR"):
            check(changed,self.document)

    def test_no_nonblocking_quality_job(self):
        with self.assertRaisesRegex(QualityContractError,"nonblocking"):
            check(self.quality+"\ncontinue-on-error: true",self.document)

    def test_no_release_push(self):
        with self.assertRaisesRegex(QualityContractError,"never publish"):
            check(self.quality+"\n- run: dotnet nuget push any.nupkg",self.document)

    def test_current_server_dependency_is_patched(self):
        check_server_patch(SSR_PROJ.read_text(encoding="utf-8-sig"))

    def test_reject_vulnerable_server_patch(self):
        original=SSR_PROJ.read_text(encoding="utf-8-sig")
        self.assertIn('Version="10.0.13"',original)
        with self.assertRaisesRegex(QualityContractError,"at least patched"):
            check_server_patch(original.replace('Version="10.0.13"','Version="10.0.12"'))

    def test_real_browser_matrix_contract(self):
        check_browser_contract(BROWSERS.read_text(encoding="utf-8-sig"),
                               BROWSER_PROBE.read_text(encoding="utf-8-sig"))

    def test_browser_job_must_run_on_every_pr(self):
        current=BROWSERS.read_text(encoding="utf-8-sig")
        with self.assertRaisesRegex(QualityContractError,"cannot skip"):
            check_browser_contract(current.replace("branches: [bluent-v3]",
                 "branches: [bluent-v3]\n    paths: [src/**]",1),
                 BROWSER_PROBE.read_text(encoding="utf-8-sig"))

    def test_browser_job_requires_both_engines_and_render_modes(self):
        current=BROWSERS.read_text(encoding="utf-8-sig")
        with self.assertRaisesRegex(QualityContractError,"browser matrix"):
            check_browser_contract(current.replace("browser: [Chrome, Edge]","browser: [Chrome]"),
                                   BROWSER_PROBE.read_text(encoding="utf-8-sig"))

    def test_browser_probe_must_capture_screenshots(self):
        with self.assertRaisesRegex(QualityContractError,"screenshot contract"):
            check_browser_contract(BROWSERS.read_text(encoding="utf-8-sig"),
                                   BROWSER_PROBE.read_text(encoding="utf-8-sig").replace("Page.captureScreenshot","Page.ignore"))

    def test_real_browser_ax_tree_cannot_be_removed(self):
        altered=BROWSER_PROBE.read_text(encoding="utf-8-sig").replace(
            "Accessibility.getFullAXTree","Accessibility.getNothing")
        with self.assertRaisesRegex(QualityContractError,"accessibility-tree"):
            check_browser_contract(BROWSERS.read_text(encoding="utf-8-sig"),altered)

    def test_ax_role_must_be_mapped_to_real_counter_element(self):
        altered=BROWSER_PROBE.read_text(encoding="utf-8-sig").replace(
            "backendDOMNodeId","otherDOMNodeId")
        with self.assertRaisesRegex(QualityContractError,"accessibility-tree"):
            check_browser_contract(BROWSERS.read_text(encoding="utf-8-sig"),altered)

    def test_browser_startup_retry_requires_real_three_attempts(self):
        original=BROWSER_PROBE.read_text(encoding="utf-8-sig")
        with self.assertRaisesRegex(QualityContractError,"startup retry"):
            check_browser_contract(BROWSERS.read_text(encoding="utf-8-sig"),
                                   original.replace("attempt<=3","attempt<=1"))

    def test_browser_startup_failures_must_remain_visible(self):
        original=BROWSER_PROBE.read_text(encoding="utf-8-sig")
        with self.assertRaisesRegex(QualityContractError,"startup retry"):
            check_browser_contract(BROWSERS.read_text(encoding="utf-8-sig"),
                                   original.replace('if(!target)throw Error','if(!target)console.log'))

    def test_browser_startup_diagnostics_must_be_artifacted(self):
        original=BROWSER_PROBE.read_text(encoding="utf-8-sig")
        with self.assertRaisesRegex(QualityContractError,"startup retry"):
            check_browser_contract(BROWSERS.read_text(encoding="utf-8-sig"),
                                   original.replace('browserStartupAttempts,imageEvidence,checks,errors','checks,errors'))

    def test_windows_chrome_zero_exit_is_not_treated_as_browser_failure(self):
        original=BROWSER_PROBE.read_text(encoding="utf-8-sig")
        # A launcher can exit 0 while its detached browser writes the CDP
        # port later. This is the proven root of the Chrome startup regression.
        altered=original.replace("candidate.exitCode!==null&&candidate.exitCode!==0",
                                 "candidate.exitCode!==null")
        with self.assertRaisesRegex(QualityContractError,"startup retry"):
            check_browser_contract(BROWSERS.read_text(encoding="utf-8-sig"),altered)

    def test_browser_cleanup_must_target_only_owned_profile(self):
        original=BROWSER_PROBE.read_text(encoding="utf-8-sig")
        altered=original.replace("cleanupOwnedBrowserProcesses(work)",
                                  "cleanupOwnedBrowserProcesses(tmpdir())")
        with self.assertRaisesRegex(QualityContractError,"startup retry"):
            check_browser_contract(BROWSERS.read_text(encoding="utf-8-sig"),altered)

    def test_browser_cleanup_failures_must_fail_job(self):
        original=BROWSER_PROBE.read_text(encoding="utf-8-sig")
        altered=original.replace("if(cleanupError)errors.push","if(cleanupError)console.log")
        with self.assertRaisesRegex(QualityContractError,"startup retry"):
            check_browser_contract(BROWSERS.read_text(encoding="utf-8-sig"),altered)

    def test_dark_sample_host_cannot_lose_painted_surface(self):
        original=COMPAT_LAYOUT.read_text(encoding="utf-8-sig")
        check_compatibility_host_theme(original)
        with self.assertRaisesRegex(QualityContractError,"sample host contrast"):
            check_compatibility_host_theme(
                original.replace("background-color: var(--colorNeutralBackground1)",
                                 "background-color: transparent"))

    def test_browser_theme_contrast_assertion_cannot_be_removed(self):
        original=BROWSER_PROBE.read_text(encoding="utf-8-sig")
        with self.assertRaisesRegex(QualityContractError,"real theme host contrast"):
            check_browser_contract(BROWSERS.read_text(encoding="utf-8-sig"),
                original.replace("ratio>=4.5","ratio>=0"))
    def test_multiline_heading_lineheight_cannot_be_removed(self):
        original=COMPAT_PROBE.read_text(encoding="utf-8-sig")
        check_compatibility_probe_text(original)
        with self.assertRaisesRegex(QualityContractError,"mobile RTL sample"):
            check_compatibility_probe_text(original.replace("line-height: 1.3","line-height: 0.7"))

    def test_link_theme_token_cannot_be_removed(self):
        original=COMPAT_PROBE.read_text(encoding="utf-8-sig")
        with self.assertRaisesRegex(QualityContractError,"mobile RTL sample"):
            check_compatibility_probe_text(original.replace(
                "color: var(--colorNeutralForeground2Link)","color: blue"))

    def test_browser_must_check_real_link_contrast(self):
        original=BROWSER_PROBE.read_text(encoding="utf-8-sig")
        with self.assertRaisesRegex(QualityContractError,"mobile RTL text/link"):
            check_browser_contract(BROWSERS.read_text(encoding="utf-8-sig"),
                original.replace("linkRatio>=4.5","linkRatio>=0"))

    def test_browser_must_check_title_fragment_overlap(self):
        original=BROWSER_PROBE.read_text(encoding="utf-8-sig")
        with self.assertRaisesRegex(QualityContractError,"mobile RTL text/link"):
            check_browser_contract(BROWSERS.read_text(encoding="utf-8-sig"),
                original.replace(
                    "rows.every((row,i)=>i===0||row.top>=rows[i-1].bottom-.8)",
                    "rows.length>0"))

    def test_browser_heading_fragments_need_distinct_visual_lines(self):
        original=BROWSER_PROBE.read_text(encoding="utf-8-sig")
        altered=original.replace(
            "list.findIndex(item=>Math.abs(item.top-row.top)<.5)===i",
            "true")
        with self.assertRaisesRegex(QualityContractError,"mobile RTL text/link"):
            check_browser_contract(BROWSERS.read_text(encoding="utf-8-sig"),altered)

    def test_no_false_accessibility_claim(self):
        with self.assertRaisesRegex(QualityContractError,"certification"):
            check(self.quality,self.document.replace("Not an accessibility certification.",""))

if __name__=="__main__":
    unittest.main()
