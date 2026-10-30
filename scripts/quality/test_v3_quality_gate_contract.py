"""Explicit negative controls proving v3 quality policy fails closed."""
from __future__ import annotations
import unittest
from pathlib import Path
from check_v3_quality_gate_contract import QUALITY,DOCUMENT,SSR_PROJ,BROWSERS,BROWSER_PROBE,COMPAT_LAYOUT,COMPAT_PROBE,check,check_server_patch,check_browser_contract,check_compatibility_host_theme,check_compatibility_probe_text,check_native_site_zoom_source,QualityContractError

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

    def test_compatibility_browser_host_port_is_isolated_per_run(self):
        probe=BROWSER_PROBE.read_text(encoding="utf-8-sig")
        for marker in (
            'import {createServer} from "node:net"',
            'socket.listen(0,"127.0.0.1"',
            'socket.close(e=>',
            'host=await allocateHostOrigin()',
            'hostOrigin:host||null',
            'v3 isolated compatibility host origin:',
        ):
            self.assertIn(marker,probe)
        self.assertNotIn('mode==="Server"?"5268":"5269"',probe)
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

    def test_browser_link_contrast_targets_unique_fixture_link(self):
        original=BROWSER_PROBE.read_text(encoding="utf-8-sig")
        with self.assertRaisesRegex(QualityContractError,"link contrast must target"):
            check_browser_contract(BROWSERS.read_text(encoding="utf-8-sig"),
                original.replace("compatibility-link","wrong-link"))

    def test_compatibility_link_has_unique_contrast_test_id(self):
        original=COMPAT_PROBE.read_text(encoding="utf-8-sig")
        with self.assertRaisesRegex(QualityContractError,"unique link selector"):
            check_compatibility_probe_text(original.replace(
                'data-testid="compatibility-link"', 'data-testid="other-link"'))

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

    def test_browser_reflow_must_check_both_200_and_400_percent(self):
        original=BROWSER_PROBE.read_text(encoding="utf-8-sig")
        changed=original.replace("[200,400]","[200]")
        with self.assertRaisesRegex(QualityContractError,"200/400% mobile text reflow"):
            check_browser_contract(BROWSERS.read_text(encoding="utf-8-sig"),changed)

    def test_browser_reflow_must_reject_horizontal_scroll(self):
        original=BROWSER_PROBE.read_text(encoding="utf-8-sig")
        changed=original.replace("result.scrollWidth<=321","result.scrollWidth>0")
        with self.assertRaisesRegex(QualityContractError,"200/400% mobile text reflow"):
            check_browser_contract(BROWSERS.read_text(encoding="utf-8-sig"),changed)

    def test_compatibility_host_padding_must_not_scale_into_viewport(self):
        original=COMPAT_LAYOUT.read_text(encoding="utf-8-sig")
        with self.assertRaisesRegex(QualityContractError,"sample host contrast"):
            check_compatibility_host_theme(
                original.replace("padding: min(2rem, 4vw)","padding: 2rem"))

    def test_native_enter_button_callback_cannot_be_skipped(self):
        original=BROWSER_PROBE.read_text(encoding="utf-8-sig")
        altered=original.replace(
            "Enter invokes actual Bluent Button callback exactly once",
            "fake Enter success")
        with self.assertRaisesRegex(QualityContractError,"keyboard/pointer modality"):
            check_browser_contract(BROWSERS.read_text(encoding="utf-8-sig"),altered)

    def test_pointer_does_not_inherit_keyboard_focus_visible(self):
        original=BROWSER_PROBE.read_text(encoding="utf-8-sig")
        altered=original.replace(
            "real pointer does not masquerade as keyboard Button focus-visible",
            "fake pointer modality")
        with self.assertRaisesRegex(QualityContractError,"keyboard/pointer modality"):
            check_browser_contract(BROWSERS.read_text(encoding="utf-8-sig"),altered)

    def test_pointer_hit_validation_cannot_be_removed(self):
        original=BROWSER_PROBE.read_text(encoding="utf-8-sig")
        altered=original.replace("document.elementFromPoint","document.querySelector")
        with self.assertRaisesRegex(QualityContractError,"keyboard/pointer modality"):
            check_browser_contract(BROWSERS.read_text(encoding="utf-8-sig"),altered)

    def test_after_keyboard_pointer_screenshot_must_reset_scroll(self):
        original=BROWSER_PROBE.read_text(encoding="utf-8-sig")
        altered=original.replace(
            "window.scrollTo({top:0,left:0,behavior:'instant'})",
            "window.scrollTo(0,999)")
        with self.assertRaisesRegex(QualityContractError,"keyboard/pointer modality"):
            check_browser_contract(BROWSERS.read_text(encoding="utf-8-sig"),altered)

    def test_native_zoom_source_contract_with_real_saved_preferences(self):
        from pathlib import Path
        path=Path(__file__).resolve().parent/"probe_v3_native_site_zoom.mjs"
        check_native_site_zoom_source(path.read_text(encoding="utf-8-sig"))

    def test_native_zoom_cannot_replace_saved_browser_preferences_with_emulation(self):
        from pathlib import Path
        source=(Path(__file__).resolve().parent/"probe_v3_native_site_zoom.mjs").read_text(encoding="utf-8")
        bad=source+"\\nEmulation.setDeviceMetricsOverride"
        with self.assertRaisesRegex(QualityContractError,"not use emulation"):
            check_native_site_zoom_source(bad)

    def test_native_zoom_must_fail_on_actual_document_overflow(self):
        from pathlib import Path
        source=(Path(__file__).resolve().parent/"probe_v3_native_site_zoom.mjs").read_text(encoding="utf-8")
        bad=source.replace("state.documentScrollWidth-state.viewportWidth","0")
        with self.assertRaisesRegex(QualityContractError,"site zoom evidence missing"):
            check_native_site_zoom_source(bad)

    def test_native_zoom_rejects_fake_pointer_label_activation(self):
        source=(Path(__file__).resolve().parent/"probe_v3_native_site_zoom.mjs").read_text(encoding="utf-8")
        bad=source.replace("Input.dispatchMouseEvent","Runtime.evaluate")
        with self.assertRaisesRegex(QualityContractError,"site zoom evidence missing"):
            check_native_site_zoom_source(bad)

    def test_native_zoom_rejects_keyboard_script_click_substitute(self):
        source=(Path(__file__).resolve().parent/"probe_v3_native_site_zoom.mjs").read_text(encoding="utf-8")
        bad=source.replace("Input.dispatchKeyEvent","Runtime.evaluate")
        with self.assertRaisesRegex(QualityContractError,"site zoom evidence missing"):
            check_native_site_zoom_source(bad)

    def test_native_zoom_rejects_missing_actual_focus_visible(self):
        source=(Path(__file__).resolve().parent/"probe_v3_native_site_zoom.mjs").read_text(encoding="utf-8")
        bad=source.replace("matches(':focus-visible')","matches(':focus')")
        with self.assertRaisesRegex(QualityContractError,"site zoom evidence missing"):
            check_native_site_zoom_source(bad)

    def test_native_zoom_rejects_enter_exact_once_removed(self):
        source=(Path(__file__).resolve().parent/"probe_v3_native_site_zoom.mjs").read_text(encoding="utf-8")
        bad=source.replace("settled===actual","settled>=actual")
        with self.assertRaisesRegex(QualityContractError,"site zoom evidence missing"):
            check_native_site_zoom_source(bad)

    def test_native_zoom_requires_real_png_screenshot(self):
        from pathlib import Path
        source=(Path(__file__).resolve().parent/"probe_v3_native_site_zoom.mjs").read_text(encoding="utf-8")
        bad=source.replace("Page.captureScreenshot","Page.fakeScreenshot")
        with self.assertRaisesRegex(QualityContractError,"site zoom evidence missing"):
            check_native_site_zoom_source(bad)

    def test_native_zoom_cannot_be_removed_from_standard_real_browser_suite(self):
        source=BROWSER_PROBE.read_text(encoding="utf-8-sig")
        bad=source.replace("probe_v3_native_site_zoom.mjs","fake-native-zoom.mjs")
        with self.assertRaisesRegex(QualityContractError,"native 200/400"):
            check_browser_contract(BROWSERS.read_text(encoding="utf-8-sig"),bad)

    def test_no_false_accessibility_claim(self):
        with self.assertRaisesRegex(QualityContractError,"certification"):
            check(self.quality,self.document.replace("Not an accessibility certification.",""))

if __name__=="__main__":
    unittest.main()
