from __future__ import annotations
import json, shutil, tempfile, unittest
from pathlib import Path
from check_v3_radiogroup_contract import RadioGroupContractError, check_radiogroup_contract
ROOT = Path(__file__).resolve().parents[2]
FILES = (
 "src/Bluent.UI/Components/RadioGroupComponent/RadioGroup.razor",
 "src/Bluent.UI/Components/RadioGroupComponent/RadioGroup.razor.cs",
 "src/Bluent.UI/Components/RadioGroupComponent/Radio.razor",
 "src/Bluent.UI/Components/RadioGroupComponent/Radio.razor.cs",
 "src/Bluent.UI/Styles/Components/_radio-group.scss",
 "src/Bluent.UI/Styles/Components/_radio.scss",
 "src/Bluent.UI/Styles/Components/components.scss",
 "src/Bluent.UI/Styles/Components/components.css",
 "src/Bluent.UI/wwwroot/bluent.ui.components.min.css",
 "src/Bluent.UI.Demo.Pages/Pages/Components/Radios.razor",
 "src/Bluent.UI.Demo.Pages/Pages/Components/Radios.razor.css",
 "src/Bluent.UI.Demo.SSR/Components/Pages/RadioInteractiveServerProbe.razor",
 "tests/RegexSampleGeneratorTest/RadioGroupRenderSemanticsTests.cs",
 "scripts/quality/probe_v3_radiogroup.mjs", "scripts/quality/run_v3_radiogroup.ps1",
 "docs/v3/components/radio-group.md",
 "docs/v3/design/RADIOGROUP-DESIGN-AND-API-CONTRACT.md",
 "docs/v3/design/MIGRATION-IMPACT-LEDGER.md",
 ".agents/skills/bluent-v3-radiogroup/SKILL.md",
 ".agents/skills/bluent-v3/COMPONENT-ROUTER.md",
 "docs/v3/skills/README.md", "docs/v3/README.md", "CHANGELOG.md", ".bluent/PROJECT.md",
 "docs/v3/quality/COMPONENT-LAB-COVERAGE.json",
 ".github/workflows/v3-compatibility-browsers.yml",
)
BROWSERS=("Chrome","Edge")
MODES=("WebAssembly","Server")
EVIDENCE=tuple(f"docs/v3/quality/evidence/{b}-{m}.json" for b in BROWSERS for m in MODES)
EVIDENCE += tuple(f"docs/v3/quality/evidence/{b}-{m}-{c}.png" for b in BROWSERS for m in MODES for c in ("initial-1280px","320px","1280px"))

class RadioGroupContractTests(unittest.TestCase):
    def setUp(self):
        self.temp=tempfile.TemporaryDirectory(prefix="bluent-radio-contract-")
        self.root=Path(self.temp.name)
        self.paths={}
        for relative in FILES+EVIDENCE:
            dest=self.root/relative
            dest.parent.mkdir(parents=True,exist_ok=True)
            shutil.copy2(ROOT/relative,dest)
            self.paths[relative]=dest
    def tearDown(self):
        self.temp.cleanup()
    def mutate(self,relative,old,new):
        path=self.paths[relative]
        body=path.read_text(encoding="utf-8-sig")
        self.assertIn(old,body)
        path.write_text(body.replace(old,new),encoding="utf-8")
        with self.assertRaises(RadioGroupContractError):
            check_radiogroup_contract(self.root)
    def test_positive_four_cell_contract(self):
        check_radiogroup_contract(self.root)
    def test_fieldset_cannot_be_removed(self):
        self.mutate(FILES[0],"<fieldset","<div")
    def test_native_value_cannot_be_removed(self):
        self.mutate(FILES[2],'value="@GetInputValue()"','data-value="@GetInputValue()"')
    def test_shared_name_cannot_be_literal(self):
        self.mutate(FILES[2],'name="@RadioGroup.RadioGroupName"','name="radio"')
    def test_edit_context_subscription_is_required(self):
        self.mutate(FILES[1],"OnValidationStateChanged += HandleValidationStateChanged","OnValidationStateChanged += OnParametersSet")
    def test_validation_must_reach_native_options(self):
        self.mutate(FILES[3],'attributes["aria-invalid"] = "true";','attributes["aria-busy"] = "true";')
    def test_focus_ring_is_required(self):
        self.mutate(FILES[5],":focus-visible",":focus")
    def test_server_keyboard_isolation_waits_for_parent_bound_state(self):
        path = self.paths["scripts/quality/probe_v3_radiogroup.mjs"]
        body = path.read_text(encoding="utf-8-sig")
        self.assertIn("document.querySelector('#radio-contact-status')", body)
        path.write_text(body.replace("document.querySelector('#radio-contact-status')", "document.querySelector('#radio-contact-missing')"), encoding="utf-8")
        with self.assertRaises(RadioGroupContractError):
            check_radiogroup_contract(self.root)

    def test_form_probe_waits_for_server_parent_binding_before_submit(self):
        demo = self.paths["src/Bluent.UI.Demo.Pages/Pages/Components/Radios.razor"]
        body = demo.read_text(encoding="utf-8-sig")
        self.assertIn('id="radio-form-selection"', body)
        demo.write_text(body.replace('id="radio-form-selection"', 'id="radio-form-selection-removed"'), encoding="utf-8")
        with self.assertRaises(RadioGroupContractError):
            check_radiogroup_contract(self.root)

    def test_preview_token_alias_is_rejected(self):
        p=self.paths[FILES[5]]
        p.write_text(p.read_text(encoding="utf-8-sig")+"\n.x { color: var(--bui-v3-unapproved); }\n")
        with self.assertRaises(RadioGroupContractError):
            check_radiogroup_contract(self.root)
    def test_browser_failed_count_is_rejected(self):
        p=self.paths[EVIDENCE[0]]
        data=json.loads(p.read_text(encoding="utf-8")); data["failed"]=1
        p.write_text(json.dumps(data))
        with self.assertRaises(RadioGroupContractError):
            check_radiogroup_contract(self.root)
    def test_browser_failed_assertion_is_rejected(self):
        p=self.paths[EVIDENCE[1]]
        data=json.loads(p.read_text(encoding="utf-8")); data["checks"][3]["pass"]=False
        p.write_text(json.dumps(data))
        with self.assertRaises(RadioGroupContractError):
            check_radiogroup_contract(self.root)
    def test_runtime_signal_is_rejected(self):
        p=self.paths[EVIDENCE[2]]
        data=json.loads(p.read_text(encoding="utf-8")); data["runtimeSignals"]=[{"type":"exception"}]
        p.write_text(json.dumps(data))
        with self.assertRaises(RadioGroupContractError):
            check_radiogroup_contract(self.root)
    def test_missing_screenshot_is_rejected(self):
        self.paths[EVIDENCE[-2]].unlink()
        with self.assertRaises(RadioGroupContractError):
            check_radiogroup_contract(self.root)
    def test_v2_lab_classification_must_stay_representative_only(self):
        p=self.paths["docs/v3/quality/COMPONENT-LAB-COVERAGE.json"]
        data=json.loads(p.read_text(encoding="utf-8"))
        next(x for x in data["families"] if x.get("id")=="radio")["classification"]="complete"
        p.write_text(json.dumps(data),encoding="utf-8")
        with self.assertRaises(RadioGroupContractError):
            check_radiogroup_contract(self.root)
    def test_penpot_ai_review_record_is_required(self):
        self.mutate("docs/v3/design/RADIOGROUP-DESIGN-AND-API-CONTRACT.md","AI REVIEWED","unreviewed")
    def test_migration_row_is_required(self):
        self.mutate("docs/v3/design/MIGRATION-IMPACT-LEDGER.md","M24","Mxx")
    def test_ci_must_keep_server_mode(self):
        p=self.paths[".github/workflows/v3-compatibility-browsers.yml"]
        body=p.read_text(encoding="utf-8-sig"); marker="  radio-group-runtime:"
        before,job=body.split(marker,1)
        p.write_text(before+marker+job.replace("render_mode: [WebAssembly, Server]","render_mode: [WebAssembly]",1),encoding="utf-8")
        with self.assertRaises(RadioGroupContractError):
            check_radiogroup_contract(self.root)
    def test_ci_artifact_upload_must_run_after_failures(self):
        p=self.paths[".github/workflows/v3-compatibility-browsers.yml"]
        body=p.read_text(encoding="utf-8-sig"); marker="  radio-group-runtime:"
        before,job=body.split(marker,1)
        p.write_text(before+marker+job.replace("if: always()","if: success()",1),encoding="utf-8")
        with self.assertRaises(RadioGroupContractError):
            check_radiogroup_contract(self.root)

if __name__=="__main__":
    unittest.main()