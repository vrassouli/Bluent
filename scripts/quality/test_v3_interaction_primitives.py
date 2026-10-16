"""Source negative controls for #420 interaction contract."""
from __future__ import annotations
import unittest
from check_v3_interaction_primitives import audit,source_snapshot,InteractionContractError

class InteropSourceContractTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.source=source_snapshot()

    def test_issue420_migration_review_tracks_behavior_not_just_api(self):
        from pathlib import Path
        root=Path(__file__).resolve().parents[2]
        doc=(root/"docs/v3/architecture/INTERACTION-CONSUMER-MIGRATION-REVIEW.md").read_text(encoding="utf-8-sig")
        ledger=(root/"docs/v3/design/MIGRATION-IMPACT-LEDGER.md").read_text(encoding="utf-8-sig")
        adr=(root/"docs/v3/architecture/ADR-0002-interaction-primitives.md").read_text(encoding="utf-8-sig")
        for name in ("Calendar MonthChanged on navigation",
                     "external SelectedDate", "same-month",
                     "MonthSelect and YearSelect", "Popover click accessibility",
                     "Popover focus and lifetime", "Native Windows Contrast Themes",
                     "Narrator/NVDA", "ee798e95c145046716960b8b54a2c2ae192d71fe"):
            self.assertIn(name,doc)
        for i in range(13,18):
            self.assertIn("M"+str(i)+" - ",ledger)
        self.assertIn("INTERACTION-CONSUMER-MIGRATION-REVIEW.md",adr)
        self.assertIn("14/14 geometry checks PASS",adr)
        self.assertIn("63",adr)

    def test_issue420_migration_sample_preserves_existing_public_calendar_api(self):
        from pathlib import Path
        root=Path(__file__).resolve().parents[2]
        doc=(root/"docs/v3/architecture/INTERACTION-CONSUMER-MIGRATION-REVIEW.md").read_text(encoding="utf-8-sig")
        calendar=(root/"src/Bluent.UI/Components/CalendarComponent/Calendar.razor.cs").read_text(encoding="utf-8-sig")
        self.assertIn('MonthChanged="OnMonthChangedAsync"',doc)
        self.assertIn('TValue="DateTime?"',doc)
        self.assertIn("EventCallback<DateOnly> MonthChanged",calendar)
        self.assertIn("EventCallback<TValue> SelectedDateChanged",calendar)
        self.assertIn("ChangeViewDateAsync",calendar)
        self.assertIn("OnParametersSetAsync",calendar)
        self.assertNotIn("new Calendar properties",doc.lower())

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

    def test_real_interactive_server_popover_uses_same_demo_and_scoped_containers(self):
        root=__import__("pathlib").Path(__file__).resolve().parents[2]
        razor=(root/"src/Bluent.UI.Demo.SSR/Components/Pages/PopoverInteractiveServerProbe.razor").read_text(encoding="utf-8-sig")
        self.assertIn('@page "/compatibility/popover-server"',razor)
        self.assertIn("@rendermode InteractiveServer",razor)
        self.assertIn("<Containers />",razor)
        self.assertIn("<Popovers />",razor)

    def test_stack_probe_is_real_shared_blazor_fixture_with_interactive_server_host(self):
        root=__import__("pathlib").Path(__file__).resolve().parents[2]
        fixture=(root/"src/Bluent.UI.Demo.Pages/Pages/Components/PopoverStackProbe.razor").read_text(encoding="utf-8-sig")
        server=(root/"src/Bluent.UI.Demo.SSR/Components/Pages/PopoverStackInteractiveServerProbe.razor").read_text(encoding="utf-8-sig")
        self.assertIn('data-popover-probe-ready=',fixture)
        self.assertIn("OnAfterRenderAsync(bool firstRender)",fixture)
        self.assertIn("private void OpenBoth()",fixture)
        self.assertEqual(fixture.count('SameWidth="true"'),2)
        self.assertIn('@rendermode InteractiveServer',server)
        self.assertIn('<Containers />',server)
        self.assertIn('<PopoverStackProbe />',server)

    def test_real_stack_browser_probe_enforces_lifo_and_independent_resize(self):
        root=__import__("pathlib").Path(__file__).resolve().parents[2]
        probe=(root/"scripts/quality/probe_v3_popover_runtime.mjs").read_text(encoding="utf-8-sig")
        for fragment in (
            "interactive Blazor stacked Popover fixture",
            "manual stack OpenBoth command delivered once",
            "two Popover surfaces can be open concurrently",
            "independent initial SameWidth matches both trigger widths",
            "first SameWidth ResizeObserver remains active with second open",
            "first Escape closes only topmost and focuses second trigger",
            "second Escape closes remaining and focuses first trigger",
            "zero-duration Escape hides surface without transitionend",
            "rapid reopen cancels pending hide",
            "old hide completion cannot conceal reopened Popover",
            "RTL with reduced-motion and forced-colors browser emulation enabled",
            "shipped Popover CSS naturally honors OS prefers-reduced-motion",
            "public DisplayArrow false opens actual Popover",
            "optional arrow positioning works without arrow DOM",
            "Popover positioning emits no unhandled JavaScript exceptions",
        ):
            self.assertIn(fragment,probe)

    def test_real_popover_browser_ci_and_artifact_gate_present(self):
        root=__import__("pathlib").Path(__file__).resolve().parents[2]
        workflow=(root/".github/workflows/v3-interaction-contract.yml").read_text(encoding="utf-8-sig")
        probe=(root/"scripts/quality/probe_v3_popover_runtime.mjs").read_text(encoding="utf-8-sig")
        for item in ("check_v3_popover_js_bundle.py", "test_v3_popover_js_bundle.py",
                     'src/Bluent.UI/Styles/Components/_popover.scss',
                     "npx --yes sass@1.93.2",
                     "src/Bluent.UI/wwwroot/bluent.ui.components.min.css",
                     "npm --prefix src/Bluent.UI.Scripts run build",
                     "git diff --exit-code -- src/Bluent.UI.Scripts/dist/",
                     "real-popover-browser:","browser: [Chrome, Edge]",
                     "render_mode: [WASM, Server]",
                     "windows-latest","probe_v3_popover_runtime.mjs",
                     "if: always()","actions/upload-artifact@v4"):
            self.assertIn(item,workflow)
        for item in ("Escape closes popover and restores exact trigger focus",
                     "outside click dismisses without moving focus to trigger",
                     "trigger reopens popover after Escape",
                     "dynamic surface rendered","manual Popover Show",
                     "popover-server","ASPNETCORE_ENVIRONMENT","Production",
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
        self.assertIn("await _interopCommands.DrainWithDestroyAsync",container)
        self.assertIn("_interopCommands.EnqueueDestroy(context.Config.Settings);",container)
        self.assertIn("triggerId => _interop.DestroyPopoverAsync(triggerId)",container)
        self.assertIn('await _popoverReference.InvokeVoidAsync("destroyPopover", triggerId);',interop)
        self.assertIn("public void EnqueueDestroy",queue)
        self.assertIn("public Task DrainWithDestroyAsync",queue)
        self.assertIn("await execute(command.Show, command.Settings);",queue)
        self.assertIn("if (_draining)",queue)
        self.assertNotIn("async void",interop)
        self.assertNotIn("catch {",interop)

    def test_real_wasm_probe_rebuilds_latest_razor_fixture(self):
        root=__import__("pathlib").Path(__file__).resolve().parents[2]
        probe=(root/"scripts/quality/probe_v3_popover_runtime.mjs").read_text(encoding="utf-8-sig")
        source=(root/"src/Bluent.UI.Demo.Pages/Pages/Components/PopoverStackProbe.razor").read_text(encoding="utf-8-sig")
        for token in ("-c","Debug","--no-launch-profile","--urls"):
            self.assertIn(token,probe)
        self.assertNotIn('"-c","Debug","--no-build"',probe,
            "WASM probe must not run stale Debug fixtures")
        for token in ("Remove first popover","_showFirst = false","@if (_showFirst)"):
            self.assertIn(token,source)
        for token in ("destroying one live Popover leaves sibling visible and usable",
                      "remaining Popover retains Escape-to-trigger-focus after sibling removal",
                      "cleanupOnlyOwnedBrowserProfiles(work)",
                      "cleanupAttempts,errors"):
            self.assertIn(token,probe)

    def test_popover_browser_ax_tree_is_measured_not_inferred_from_dom(self):
        root=__import__("pathlib").Path(__file__).resolve().parents[2]
        probe=(root/"scripts/quality/probe_v3_popover_runtime.mjs").read_text(encoding="utf-8-sig")
        for token in ("Accessibility.getPartialAXTree",
                      "objectId:obj.result.objectId",
                      "fetchRelatives:false",
                      "Chromium AX tree exposes labeled focusable button as collapsed",
                      "Chromium AX tree exposes expanded trigger and valid controlled surface",
                      "Chromium AX tree reports collapsed focused trigger after Escape",
                      'axAfterEscape.focused===true',
                      'axOpened.controlsTargetIds.includes(openedDisclosure.surface)'):
            self.assertIn(token,probe)

    def test_popover_browser_ax_tree_must_not_be_reduced_to_dom_checks(self):
        root=__import__("pathlib").Path(__file__).resolve().parents[2]
        probe=(root/"scripts/quality/probe_v3_popover_runtime.mjs").read_text(encoding="utf-8-sig")
        self.assertIn('const tree=await cdp.send("Accessibility.getPartialAXTree"',probe)
        self.assertEqual(probe.count("const axInitiallyClosed=await triggerAxEvidence(cdp);"),1)
        self.assertEqual(probe.count("const axOpened=await triggerAxEvidence(cdp);"),1)
        self.assertEqual(probe.count("const axAfterEscape=await triggerAxEvidence(cdp);"),1)
        self.assertNotIn("AX_RESEARCH_",probe)

    def test_calendar_selection_handlers_use_awaitable_blazor_callbacks(self):
        root=__import__("pathlib").Path(__file__).resolve().parents[2]
        calendar=(root/"src/Bluent.UI/Components/CalendarComponent/Calendar.razor.cs").read_text(encoding="utf-8-sig")
        markup=(root/"src/Bluent.UI/Components/CalendarComponent/Calendar.razor").read_text(encoding="utf-8-sig")
        fixture=(root/"src/Bluent.UI.Demo.Pages/Pages/Components/CalendarAsyncProbe.razor").read_text(encoding="utf-8-sig")
        host=(root/"src/Bluent.UI.Demo.SSR/Components/Pages/CalendarAsyncInteractiveServerProbe.razor").read_text(encoding="utf-8-sig")
        probe=(root/"scripts/quality/probe_v3_popover_runtime.mjs").read_text(encoding="utf-8-sig")
        for method in ("OnMonthSelected(DateTime monthStart)","OnYearSelected(DateTime yearStart)"):
            self.assertIn("private async Task "+method,calendar)
            self.assertNotIn("async void "+method,calendar)
        self.assertNotIn("async void",calendar,
            "Calendar private event callbacks should never fire-and-forget")
        for token in ('@onclick="()=>OnMonthSelected(monthStart)"',
                      '@onclick="()=>OnYearSelected(yearStart)"'):
            self.assertIn(token,markup)
        for token in ('MonthSelectedAsync','YearSelectedAsync',
                      'TaskCompletionSource','await _monthGate.Task','await _yearGate.Task'):
            self.assertIn(token,fixture)
        self.assertIn('<CalendarAsyncProbe />',host)
        for token in ("real Calendar MonthSelect and YearSelect fixture mounted",
                      "Calendar callback finishes after awaited release",
                      "for(const kind of [\"month\",\"year\"])"):
            self.assertIn(token,probe)

    def test_calendar_month_changed_must_be_awaited_from_all_real_event_sources(self):
        root=__import__("pathlib").Path(__file__).resolve().parents[2]
        calendar=(root/"src/Bluent.UI/Components/CalendarComponent/Calendar.razor.cs").read_text(encoding="utf-8-sig")
        probe=(root/"scripts/quality/probe_v3_popover_runtime.mjs").read_text(encoding="utf-8-sig")
        fixture=(root/"src/Bluent.UI.Demo.Pages/Pages/Components/CalendarAsyncProbe.razor").read_text(encoding="utf-8-sig")
        self.assertNotIn("InvokeAsync(() => MonthChanged.InvokeAsync",calendar)
        self.assertIn("private async Task ChangeViewDateAsync(DateTime value)",calendar)
        self.assertIn("await MonthChanged.InvokeAsync(DateOnly.FromDateTime(ViewDate));",calendar)
        self.assertIn("protected override async Task OnParametersSetAsync()",calendar)
        self.assertIn("await MonthChanged.InvokeAsync(changedMonth);",calendar)
        for name in ("OnGoToToday","OnPreviousMonth","OnNextMonth",
                     "OnPreviousYear","OnNextYear","OnPreviousYearRange","OnNextYearRange"):
            self.assertIn("Task "+name+"(",calendar)
        for name in ("month","year","navigation","external"):
            self.assertIn('data-calendar-kind="'+name+'"',fixture)
        self.assertIn('for(const kind of ["navigation","external"])',probe)
        self.assertIn("MonthChanged completes after awaited release",probe)

    def test_popover_disposal_unsubscribes_even_if_js_throws(self):
        interop=self.source["PopoverInterop.cs"]
        component=(__import__("pathlib").Path(__file__).resolve().parents[2]/
                   "src/Bluent.UI/Components/PopoverComponent/PopoverContainerBase.cs").read_text(encoding="utf-8-sig")
        self.assertIn("catch (JSDisconnectedException)",interop)
        self.assertIn("_handlerReference?.Dispose();",interop)
        self.assertIn("_handlerReference = null;",interop)
        self.assertIn('await _popoverReference.InvokeVoidAsync("dispose");',interop)
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
