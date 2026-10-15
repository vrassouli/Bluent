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
        self.assertEqual(len(result["PopoverInterop.cs"]["legacyAsyncVoid"]),2)
        self.assertEqual(len(result["OverflowInterop.cs"]["legacyAsyncVoid"]),1)
        self.assertEqual(result["OverflowInterop.cs"]["legacyBroadExceptionCatches"],0)
        self.assertEqual(len(result["AudioCaptureInterop.cs"]["legacyAsyncVoid"]),0)
        self.assertEqual(result["AudioCaptureInterop.cs"]["legacyBroadExceptionCatches"],0)
        self.assertTrue(result["DataGridInterop.cs"]["hasDotNetObjectReference"])

    def test_overflow_initialization_awaited_in_interactive_render_lifecycle(self):
        interop=self.source["OverflowInterop.cs"]
        consumer=(__import__("pathlib").Path(__file__).resolve().parents[2]/
                  "src/Bluent.UI/Components/OverflowComponent/Overflow.razor.cs").read_text(encoding="utf-8-sig")
        self.assertIn("public async Task InitAsync(string id)",interop)
        self.assertIn('await module.InvokeVoidAsync("init", id);',interop)
        self.assertIn("protected override async Task OnAfterRenderAsync(bool firstRender)",consumer)
        self.assertIn("await _interop.InitAsync(GetOverflowId());",consumer)
        self.assertIn("await base.OnAfterRenderAsync(firstRender);",consumer)
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
        texts["PopoverInterop.cs"]=texts["PopoverInterop.cs"].replace("_handlerReference.Dispose();","/* no disposal */")
        with self.assertRaisesRegex(InteractionContractError,"has no disposal"):
            audit(texts)

if __name__=="__main__":
    unittest.main()
