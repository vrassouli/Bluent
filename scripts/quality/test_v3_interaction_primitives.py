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
        self.assertEqual(len(result["OverflowInterop.cs"]["legacyAsyncVoid"]),2)
        self.assertEqual(len(result["AudioCaptureInterop.cs"]["legacyAsyncVoid"]),1)
        self.assertTrue(result["DataGridInterop.cs"]["hasDotNetObjectReference"])

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
