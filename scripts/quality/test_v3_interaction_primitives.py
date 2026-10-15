"""Source negative controls for #420 interaction contract."""
from __future__ import annotations
import unittest
from check_v3_interaction_primitives import audit,source_snapshot,InteractionContractError

class InteropSourceContractTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.source=source_snapshot()

    def test_current_interop_legacy_debt_is_frozen(self):
        result=audit(self.source)
        self.assertEqual(len(result["PopoverInterop.cs"]["legacyAsyncVoid"]),0)
        self.assertEqual(len(result["OverflowInterop.cs"]["legacyAsyncVoid"]),0)
        self.assertEqual(result["OverflowInterop.cs"]["legacyBroadExceptionCatches"],0)
        self.assertEqual(len(result["AudioCaptureInterop.cs"]["legacyAsyncVoid"]),0)
        self.assertEqual(result["AudioCaptureInterop.cs"]["legacyBroadExceptionCatches"],0)
        self.assertTrue(result["DataGridInterop.cs"]["hasDotNetObjectReference"])
        self.assertEqual(result["DataGridInterop.cs"]["legacyBroadExceptionCatches"],0)
        self.assertEqual(result["DataGridInterop.cs"]["legacyUntypedCatches"],0)
        self.assertEqual(result["PopoverInterop.cs"]["legacyUntypedCatches"],0)
        self.assertEqual(result["BluentTheme.cs"]["legacyBroadExceptionCatches"],0)
        self.assertEqual(result["OptFieldInterop.cs"]["legacyBroadExceptionCatches"],0)
        self.assertEqual(result["PopoverInterop.cs"]["legacyBroadExceptionCatches"],0)

    def test_domhelper_pointer_refs_released_at_unregister_and_dispose(self):
        helper=self.source["DomHelper.cs"]
        self.assertIn("Dictionary<string, DotNetObjectReference<IPointerMoveEventHandler>>",helper)
        self.assertIn("Dictionary<string, DotNetObjectReference<IPointerUpEventHandler>>",helper)
        self.assertIn("_pointerMoveReferences.Remove(handler.Id, out var reference)",helper)
        self.assertIn("_pointerUpReferences.Remove(handler.Id, out var reference)",helper)
        self.assertIn("_pointerMoveReferences.Clear();",helper)
        self.assertIn("_pointerUpReferences.Clear();",helper)
        self.assertIn("catch (JSDisconnectedException)",helper)
        self.assertNotIn("catch (Exception)",helper)
        self.assertEqual(self.source["DomHelper.cs"].count("async void"),0)

    def test_datagrid_disposal_keeps_base_cleanup_on_js_error(self):
        interop=self.source["DataGridInterop.cs"]
        component=(__import__("pathlib").Path(__file__).resolve().parents[2]/
                   "src/Bluent.UI/Components/DataGridComponent/DataGrid.razor.cs").read_text(encoding="utf-8-sig")
        self.assertNotIn("catch (Exception)",interop)
        self.assertIn("catch (JSDisconnectedException)",interop)
        self.assertIn("_handlerReference?.Dispose();",interop)
        self.assertIn("_handlerReference = null;",interop)
        self.assertIn("finally",component)
        self.assertIn("await base.DisposeAsync();",component)

    def test_no_fire_and_forget_or_blanket_catches_remain_in_reviewed_interops(self):
        result=audit(self.source)
        for name,row in result.items():
            with self.subTest(file=name):
                self.assertEqual(row["legacyAsyncVoid"],[])
                self.assertEqual(row["legacyBroadExceptionCatches"],0)
                self.assertEqual(row["legacyUntypedCatches"],0)

    def test_real_popover_browser_ci_and_artifact_gate_present(self):
        root=__import__("pathlib").Path(__file__).resolve().parents[2]
        workflow=(root/".github/workflows/v3-interaction-contract.yml").read_text(encoding="utf-8-sig")
        probe=(root/"scripts/quality/probe_v3_popover_runtime.mjs").read_text(encoding="utf-8-sig")
        for item in ("real-popover-browser:","browser: [Chrome, Edge]",
                     "windows-latest","probe_v3_popover_runtime.mjs",
                     "if: always()","actions/upload-artifact@v4"):
            self.assertIn(item,workflow)
        for item in ("dynamic surface rendered","manual Popover Show",
                     "manual Popover Close","Page.captureScreenshot","Runtime.evaluate"):
            self.assertIn(item,probe)

    def test_popover_events_are_synchronously_queued_then_awaited_after_render(self):
        interop=self.source["PopoverInterop.cs"]
        container=(__import__("pathlib").Path(__file__).resolve().parents[2]/
                   "src/Bluent.UI/Components/PopoverComponent/PopoverContainerBase.cs").read_text(encoding="utf-8-sig")
        queue=(__import__("pathlib").Path(__file__).resolve().parents[2]/
               "src/Bluent.UI/Interops/PopoverCommandQueue.cs").read_text(encoding="utf-8-sig")
        self.assertIn("public async Task SetPopoverAsync",interop)
        self.assertIn("public async Task ShowSurfaceAsync",interop)
        self.assertIn("_interopCommands.Enqueue(false,",container)
        self.assertIn("_interopCommands.Enqueue(true,",container)
        self.assertIn("protected override async Task OnAfterRenderAsync",container)
        self.assertIn("await _interopCommands.DrainAsync",container)
        self.assertIn("await execute(command.Show, command.Settings);",queue)
        self.assertIn("if (_draining)",queue)
        self.assertNotIn("async void",interop)
        self.assertNotIn("catch {",interop)

    def test_popover_disposal_unsubscribes_even_if_js_throws(self):
        interop=self.source["PopoverInterop.cs"]
        component=(__import__("pathlib").Path(__file__).resolve().parents[2]/
                   "src/Bluent.UI/Components/PopoverComponent/PopoverContainerBase.cs").read_text(encoding="utf-8-sig")
        self.assertIn("catch (JSDisconnectedException)",interop)
        self.assertIn("_handlerReference?.Dispose();",interop)
        self.assertIn("_handlerReference = null;",interop)
        self.assertNotIn("catch (Exception)",interop)
        self.assertIn("finally",component)
        self.assertIn("service.OnSetTrigger -= PopoverOnSet;",component)
        self.assertIn("service.OnShowSurface -= PopoverOnShowSurface;",component)
        self.assertIn("service.OnRefreshSurface -= PopoverOnRefreshSurface;",component)

    def test_otp_disposal_is_independent_and_failure_visible(self):
        interop=self.source["OptFieldInterop.cs"]
        self.assertIn("catch (JSDisconnectedException)",interop)
        self.assertIn("finally",interop)
        self.assertIn("_reference = null;",interop)
        self.assertIn("_module = null;",interop)
        self.assertEqual(interop.count("catch (Exception)"),0)
        self.assertIn("public async Task InitializeAsync(string id)",interop)

    def test_overflow_initialization_awaited_in_interactive_render_lifecycle(self):
        interop=self.source["OverflowInterop.cs"]
        consumer=(__import__("pathlib").Path(__file__).resolve().parents[2]/
                  "src/Bluent.UI/Components/OverflowComponent/Overflow.razor.cs").read_text(encoding="utf-8-sig")
        self.assertIn("public async Task InitAsync(string id)",interop)
        self.assertIn('await module.InvokeVoidAsync("init", id);',interop)
        self.assertIn("protected override async Task OnAfterRenderAsync(bool firstRender)",consumer)
        self.assertIn("await _interop.InitAsync(GetOverflowId());",consumer)
        self.assertIn("await base.OnAfterRenderAsync(firstRender);",consumer)
        self.assertIn("await _interop.CheckOverflowAsync();",consumer)
        self.assertIn("_checkOverflowOnNextRender = true;",consumer)
        self.assertIn("StateHasChanged();",consumer)
        self.assertIn("public async Task CheckOverflowAsync()",interop)
        self.assertIn('await module.InvokeVoidAsync("checkOverflow");',interop)
        self.assertNotIn("async void",interop)
        self.assertIn("finally",consumer)
        self.assertIn("await base.DisposeAsync();",consumer)
        self.assertNotIn("protected override void OnAfterRender(",consumer)
        self.assertNotIn("async void Init",interop)
        self.assertIn("catch (JSDisconnectedException)",interop)
        self.assertNotIn("catch (Exception)",interop)

    def test_audio_stop_is_awaited_without_async_void_or_swallow(self):
        interop=self.source["AudioCaptureInterop.cs"]
        consumer=(__import__("pathlib").Path(__file__).resolve().parents[2]/
                  "src/Bluent.UI/Components/AudioCaptureComponent/AudioCapture.razor.cs").read_text(encoding="utf-8-sig")
        self.assertIn("public async Task StopAsync()",interop)
        self.assertIn('await module.InvokeVoidAsync("stop");',interop)
        self.assertIn("await _interop.StopAsync();",consumer)
        self.assertNotIn("async void Stop",interop)
        self.assertNotIn("catch (Exception)",interop)
        self.assertIn("finally",interop)
        self.assertIn("_handlerReference?.Dispose();",interop)

    def test_new_async_void_must_fail(self):
        texts=dict(self.source)
        texts["PopoverInterop.cs"]+="\npublic async void Unreviewed() { await Task.Delay(1); }\n"
        with self.assertRaisesRegex(InteractionContractError,"fire-and-forget"):
            audit(texts)

    def test_new_broad_exception_swallow_must_fail(self):
        texts=dict(self.source)
        texts["DataGridInterop.cs"]+="\ncatch (Exception) { }\n"
        with self.assertRaisesRegex(InteractionContractError,"blanket Exception"):
            audit(texts)

    def test_new_file_broad_catch_has_no_legacy_exemption(self):
        texts=dict(self.source)
        texts["NewInterop.cs"]="internal class NewInterop { void X() { try { } catch (Exception) {} } }"
        with self.assertRaisesRegex(InteractionContractError,"blanket Exception"):
            audit(texts)

    def test_new_untyped_catch_block_fails_closed(self):
        texts=dict(self.source)
        texts["PopoverInterop.cs"] += "\ntry {} catch { /* bad */ }\n"
        with self.assertRaisesRegex(InteractionContractError,"untyped catch"):
            audit(texts)

    def test_untyped_catch_in_new_interop_is_not_grandfathered(self):
        texts=dict(self.source)
        texts["NewInterop.cs"]="internal class NewInterop {void Run(){try{}catch{}}}"
        with self.assertRaisesRegex(InteractionContractError,"untyped catch"):
            audit(texts)

    def test_new_file_async_void_has_no_legacy_exemption(self):
        texts=dict(self.source)
        texts["NewInterop.cs"]="internal class NewInterop { public async void FireAndForget() {} }"
        with self.assertRaisesRegex(InteractionContractError,"fire-and-forget"):
            audit(texts)

    def test_removing_existing_legacy_debt_is_allowed(self):
        texts=dict(self.source)
        texts["PopoverInterop.cs"]=texts["PopoverInterop.cs"].replace("public async void SetPopover","public async Task SetPopover")
        self.assertNotIn("SetPopover",audit(texts)["PopoverInterop.cs"]["legacyAsyncVoid"])

    def test_dotnet_reference_requires_source_disposal_call(self):
        texts=dict(self.source)
        texts["PopoverInterop.cs"]=texts["PopoverInterop.cs"].replace("_handlerReference?.Dispose();","/* no disposal */")
        with self.assertRaisesRegex(InteractionContractError,"has no disposal"):
            audit(texts)

if __name__=="__main__":
    unittest.main()
