#!/usr/bin/env python3
"""Source-backed pilot coverage contract. Does not claim complete component validation."""
import json
import re
from pathlib import Path
from generate_v3_component_lab_queue import payload as expected_full_queue
from generate_v3_component_lab_ui_queue import render as generated_ui_queue

ROOT = Path(__file__).resolve().parents[2]
LAB = ROOT / "src/Bluent.UI.Demo.Pages/Pages/Components/ComponentLab.razor"
STYLE = LAB.with_suffix(".razor.css")
MENU = ROOT / "src/Bluent.UI.Demo.Pages/Layout/Side.razor"
LEDGER = ROOT / "docs/v3/quality/COMPONENT-LAB-COVERAGE.json"
QUEUE = ROOT / "docs/v3/quality/COMPONENT-LAB-FAMILY-QUEUE.json"


def check() -> int:
    data = json.loads(LEDGER.read_text(encoding="utf-8"))
    source = LAB.read_text(encoding="utf-8-sig")
    css = STYLE.read_text(encoding="utf-8-sig")
    menu = MENU.read_text(encoding="utf-8-sig")
    assert data["schemaVersion"] == 1 and data["issue"] == 421
    assert data["status"] == "pilot_incomplete", "do not infer full coverage from a partial demo"
    assert data["designSource"]["fileId"] == "b64f6665-c9ab-80b5-8008-c4ac99d9d000"
    assert data["designSource"]["approval"] == "pending"
    assert len(data["families"]) == 18
    assert data["families"][1]["propertiesDemonstrated"] == ["Value", "Variant"]
    assert data["families"][2]["propertiesDemonstrated"] == [
        "Text", "ForExpression", "RequiredSymbol", "Size", "Required", "Info"
    ]
    assert data["families"][3]["propertiesDemonstrated"] == ["Text", "Href", "Appearance", "OnClick"]
    for feature in ('id="lab-link-mode"', 'id="lab-link-appearance"', 'id="lab-link-text"',
                    'OnClick="LinkClickedAsync"', 'SelectedLinkRazor', 'LinkAppearance'):
        assert feature in source, "existing-API Link pilot missing: " + feature
    probe_text = (ROOT / "scripts/quality/probe_v3_component_lab.mjs").read_text(encoding="utf-8-sig")
    for gate in ("Link real appearance and text public parameters update native anchor",
                 "Link without Href emits semantic type=button instead of fake navigation",
                 "native Enter triggers exactly one live Link OnClick Blazor callback",
                 "Link action copyable Razor includes real OnClick and handler body"):
        assert gate in probe_text, "missing real Link browser gate: " + gate
    for gate in (
        "fourteenth MaskedField renders native regex digit and disabled specimens",
        "MaskedField three current public inputs show independent initial values",
        "native MaskedField regex input updates actual bound Blazor model",
        "native Persian digit becomes ASCII through MaskedField AsciiDigits",
        "disabled MaskedField denies native focus and retains its own value",
        "copyable MaskedField Razor contains regex AsciiDigits and disabled examples",
        "RTL 320px compact MaskedField cards keep 8px separation without overflow",
        "RTL masked status stays right aligned with logical LTR English text",
        "queue #440 retains incomplete MaskedField with live specimen link",
        "queue launches fourteenth MaskedField without claiming issue #440 Done",
    ):
        assert gate in probe_text, "missing MaskedField browser gate: " + gate
    assert data["families"][17]["id"] == "file"
    assert data["families"][17]["classification"] == "representative_only"
    assert data["families"][17]["existingDemoRoute"] == "/components/file-selects"
    assert set(data["families"][17]["propertiesDemonstrated"]) == {
        "Text", "Accept", "MaxFiles", "OnChange", "AllowRemove", "ShowFileInfo", "Disabled"
    }
    file_source=(ROOT/"src/Bluent.UI/Components/FileSelectComponent/FileSelect.razor.cs").read_text(encoding="utf-8-sig")
    assert "[Parameter] public int MaxFiles" in file_source and "private bool Multiple => MaxFiles > 1" in file_source
    assert "[Parameter] public EventCallback<IEnumerable<SelectedFile>> OnChange" in file_source
    assert "public bool Multiple {" not in file_source, "old demo Multiple attribute is not a supported public parameter"
    for marker in ('new("file", "FileSelect"', 'class="lab-file-grid"', 'id="lab-file-single"',
                   'id="lab-file-multi"', 'id="lab-file-disabled"', 'SelectedFileRazor',
                   'OnChange="OnLabSingleFilesChanged"', 'OnChange="OnLabMultipleFilesChanged"',
                   'MaxFiles="2"', 'ShowFileInfo="false"', 'Disabled'):
        assert marker in source, "missing real FileSelect public API pilot: "+marker
    assert '.lab-canvas.narrow .lab-file-grid' in css
    assert '.lab-canvas.compact .lab-file-card' in css
    assert '.lab-file-card ::deep .files { display:grid;' in css
    assert '.lab-file-card ::deep .bui-file-select .files { row-gap:.625rem !important;' in css
    assert '.lab-canvas[dir="rtl"] .lab-file-card p { text-align:right; }' in css
    for fixture in ('bluent-421-upload-one.txt', 'bluent-421-upload-two.md'):
        assert (ROOT/'scripts/quality/fixtures'/fixture).is_file()
    for gate in (
        "eighteenth real FileSelect renders three current public InputFile specimens",
        "FileSelect native multiple from MaxFiles plus Accept hint disabled button and independent initial status",
        "actual native synthetic text attachment updates FileSelect single file and Blazor OnChange",
        "actual two native synthetic uploads bind MaxFiles=2 names into Blazor and render file Cards",
        "selected file Cards are separated >=8px, within bounds and full MaxFiles hides chooser",
        "real FileSelect native Card remove restores single slot and OnChange empty model",
        "copyable public FileSelect Razor uses MaxFiles not removed Multiple API and real callbacks",
        "RTL 320px compact FileSelect three Cards stack with >=8px separation without overflow",
        "RTL native FileSelect filenames stay logical LTR while right-aligned",
        "queue #444 exposes unfinished FileSelect and real live native upload pilot",
        "queue launches eighteenth FileSelect demo without accepting product #444",
    ):
        assert gate in probe_text, "missing FileSelect real browser gate: "+gate
    assert data["families"][16]["id"] == "range"
    assert data["families"][16]["classification"] == "representative_only"
    assert data["families"][16]["existingDemoRoute"] == "/components/sliders"
    assert set(data["families"][16]["propertiesDemonstrated"]) == {
        "Value", "ValueChanged", "Min", "Max", "ThumbSize"
    }
    range_source=(ROOT/"src/Bluent.UI/Components/RangeSliderComponent/RangeSlider.razor.cs").read_text(encoding="utf-8-sig")
    assert "public ValueRange<TValue>? Value" in range_source and "public int? ThumbSize" in range_source
    assert "public EventCallback<ValueRange<TValue>?> ValueChanged" in range_source
    for marker in ('new("range", "RangeSlider"', 'class="lab-range-grid"',
                   'id="lab-range-int"', 'id="lab-range-decimal"',
                   'SelectedRangeRazor', 'private ValueRange<int> _labRangeInt',
                   'private ValueRange<decimal> _labRangeDecimal'):
        assert marker in source, "current public RangeSlider demo missing: "+marker
    assert '.lab-canvas.narrow .lab-range-grid' in css
    assert '.lab-canvas.compact .lab-range-card' in css
    assert '.lab-canvas[dir="rtl"] .lab-range-card p { text-align:right; }' in css
    for gate in (
        "seventeenth actual source RangeSlider renders both public generic two-thumb specimens",
        "RangeSlider true ValueRange int/decimal and public ThumbSize initialize two native thumb geometries",
        "real CDP pointer updates current int ValueRange via RangeSlider ValueChanged in WASM",
        "real CDP pointer updates current decimal ValueRange via RangeSlider ValueChanged in WASM",
        "QA KNOWN GAP #443: InteractiveServer RangeSlider pointer ValueChanged NOT asserted",
        "RangeSlider copyable Razor contains real ValueRange<int>/decimal binding plus Min Max ThumbSize",
        "RTL 320px compact RangeSlider two separate cards keep >=8px gap and both rails inside bounds",
        "RTL RangeSlider English bound range labels remain LTR and right-aligned",
        "queue #443 exposes unfinished RangeSlider product issue with real live lab pilot",
        "queue launches seventeenth RangeSlider lab specimen without completing #443",
    ):
        assert gate in probe_text, "missing RangeSlider real browser gate: "+gate
    assert data["families"][15]["id"] == "slider"
    assert data["families"][15]["classification"] == "representative_only"
    assert data["families"][15]["existingDemoRoute"] == "/components/sliders"
    assert set(data["families"][15]["propertiesDemonstrated"]) == {
        "Value", "ValueChanged", "Min", "Max", "ThumbSize"
    }
    slider_source=(ROOT/"src/Bluent.UI/Components/SliderComponent/Slider.razor.cs").read_text(encoding="utf-8-sig")
    assert "public int? ThumbSize" in slider_source and "public TValue? Min" in slider_source
    for marker in ('new("slider", "Slider"', 'class="lab-slider-grid"', 'id="lab-slider-int"',
                   'id="lab-slider-double"', 'SelectedSliderRazor', 'ThumbSize="28"',
                   'private int _labSliderInt', 'private double _labSliderDouble'):
        assert marker in source, "missing current public Slider demo: "+marker
    assert '.lab-canvas.narrow .lab-slider-grid' in css
    assert '.lab-canvas.compact .lab-slider-card' in css
    assert '.lab-canvas[dir="rtl"] .lab-slider-card p { text-align:right; }' in css
    assert "QA KNOWN GAP #442: InteractiveServer Slider pointer binding not asserted" in probe_text
    assert "if(renderMode==='WebAssembly')" in probe_text
    for gate in ("sixteenth existing Slider renders two real numeric source component specimens",
                 "Slider original int/double bindings and public ThumbSize emit real geometry",
                 "real CDP pointer activation changes generic integer Slider and invokes Blazor ValueChanged",
                 "real CDP pointer activation changes generic double Slider bound value",
                 "copyable Slider public Razor demonstrates typed Min Max ThumbSize and ValueChanged binding",
                 "RTL 320px compact Slider cards have >=8px gap and rails never overflow",
                 "RTL Slider English status remains logical LTR but is right-aligned",
                 "queue #442 retains incomplete Slider issue and offers new live pilot",
                 "queue launches sixteenth real Slider without claiming #442 completion"):
        assert gate in probe_text, "missing actual Slider browser gate: "+gate
    assert data["families"][14]["id"] == "otp"
    assert data["families"][14]["classification"] == "representative_only"
    assert data["families"][14]["existingDemoRoute"] == "/components/fields"
    assert set(data["families"][14]["propertiesDemonstrated"]) == {
        "Value", "ValueChanged", "BindValueEvent", "Length", "Password", "AutoSubmit"
    }
    otp_source=(ROOT/"src/Bluent.UI/Components/OtpFieldComponent/OtpField.razor.cs").read_text(encoding="utf-8-sig")
    for marker in ("public int Length", "public bool Password", "public bool AutoSubmit"):
        assert marker in otp_source
    for marker in ('new("otp", "OtpField"', 'class="lab-otp-grid"', 'id="lab-otp-code"',
                   'id="lab-otp-secret"', 'id="lab-otp-auto"', 'SelectedOtpRazor',
                   'BindValueEvent="oninput" Length="4"', 'Length="6" Password',
                   'Length="3" AutoSubmit'):
        assert marker in source, "current public OtpField pilot missing: "+marker
    assert '.lab-canvas.narrow .lab-otp-grid' in css
    assert '.lab-canvas.compact .lab-otp-card' in css
    assert '.lab-canvas[dir="rtl"] .lab-otp-card p { text-align:right; }' in css
    for marker in ("fifteenth native OtpField scenario renders three genuine JS-backed specimens",
                   "OtpField source Length 4/6/3 Password AutoSubmit and hidden binding match actual runtime DOM",
                   "existing OtpField initializes its real JS interop on all three independent instances",
                   "real native digit input and JS focus advance bind 12 into Blazor Value",
                   "OTP JS automatically advances keyboard focus to the third digit",
                   "complete native three-digit OTP AutoSubmit invokes its actual Blazor form handler once",
                   "OtpField auto-submit has no duplicate submit callback after completion",
                   "copyable OTP Razor shows real Length Password AutoSubmit and oninput binding",
                   "RTL 320px compact OTP cards and all digit inputs stay within column with >=8px gap",
                   "RTL OTP English bound status stays LTR while its card is right-aligned",
                   "queue #441 links unfinished OtpField product issue and 15th pilot",
                   "queue launches actual fifteenth OtpField JS-backed pilot without #441 acceptance"):
        assert marker in probe_text, "OTP real-browser regression gate missing: "+marker
    # #421 can introduce a current-API TextField specimen even while
    # the actual v3 product redesign #432 remains Backlog.
    assert data["families"][13]["id"] == "masked"
    assert data["families"][13]["classification"] == "representative_only"
    assert data["families"][13]["existingDemoRoute"] == "/components/fields"
    assert set(data["families"][13]["propertiesDemonstrated"]) == {
        "Value", "ValueChanged", "Mask", "AsciiDigits", "disabled"
    }
    ms=(ROOT/"src/Bluent.UI/Components/MaskedFieldComponent/MaskedField.razor.cs").read_text(encoding="utf-8-sig")
    assert "public string Mask" in ms and "public bool AsciiDigits" in ms
    for marker in ('new("masked", "MaskedField"', 'class="lab-masked-grid"',
                   'id="lab-mask-code"', 'id="lab-mask-digits"',
                   'id="lab-mask-disabled"', 'AsciiDigits />',
                   'SelectedMaskedRazor'):
        assert marker in source, "Source-backed MaskedField sample missing: "+marker
    assert '.lab-canvas.narrow .lab-masked-grid' in css
    assert '.lab-canvas.compact .lab-masked-card' in css
    assert '.lab-canvas[dir="rtl"] .lab-masked-card p { text-align:right; }' in css
    mask_queue=next(e for e in json.loads(QUEUE.read_text(encoding="utf-8-sig"))["families"]
                    if e["family"]=="MaskedField")
    assert mask_queue["scenarioId"]=="maskedfield-regex-ascii-disabled"
    assert data["families"][12]["id"] == "timefield"
    assert data["families"][12]["classification"] == "representative_only"
    assert data["families"][12]["existingDemoRoute"] == "/components/fields"
    assert set(data["families"][12]["propertiesDemonstrated"]) == {
        "Value", "ValueChanged", "Culture", "Seconds", "disabled"
    }
    time_source=(ROOT/"src/Bluent.UI/Components/TimeFieldComponent/TimeField.razor").read_text(encoding="utf-8-sig")
    assert '<MaskedField Mask="@GetMask()"' in time_source
    for marker in ('new("timefield", "TimeField"', 'class="lab-time-grid"',
                   'id="lab-time-basic"', 'id="lab-time-seconds"',
                   'id="lab-time-span"', 'id="lab-time-disabled"',
                   'SelectedTimeFieldRazor','Seconds />'):
        assert marker in source, "Current TimeField real source sample missing: "+marker
    assert '.lab-canvas.narrow .lab-time-grid' in css
    assert '.lab-canvas.compact .lab-time-card' in css
    assert '.lab-canvas[dir="rtl"] .lab-time-card p { text-align:right; }' in css
    time_queue=next(e for e in json.loads(QUEUE.read_text(encoding="utf-8-sig"))["families"]
                    if e["family"]=="TimeField")
    assert time_queue["scenarioId"]=="timefield-timeonly-seconds-timespan-disabled"
    for gate in (
        "thirteenth TimeField renders real existing native masked TimeOnly/TimeSpan inputs",
        "TimeField original TimeOnly minute seconds TimeSpan and disabled mask render",
        "native masked TimeField text edit updates typed TimeOnly Blazor value 9:30 to 9:31",
        "native disabled TimeField input cannot focus and retains independent value",
        "copyable TimeField Razor contains TimeOnly Seconds TimeSpan and disabled current API",
        "RTL 320px TimeField four cards are one real separated non-overflow column",
        "RTL TimeField English time status remains LTR but right aligned",
        "source queue #439 retains TimeField Backlog with runnable live pilot link",
        "source queue launches thirteenth TimeField without completing #439",
    ):
        assert gate in (ROOT/"scripts/quality/probe_v3_component_lab.mjs").read_text(encoding="utf-8-sig")
    assert data["families"][11]["id"] == "datefield"
    assert data["families"][11]["classification"] == "representative_only"
    assert data["families"][11]["existingDemoRoute"] == "/components/fields"
    assert set(data["families"][11]["propertiesDemonstrated"]) == {
        "Value", "ValueChanged", "Culture", "Mode", "DisplayCalendar", "disabled"
    }
    date_source=(ROOT/"src/Bluent.UI/Components/DateFieldComponent/DateField.razor").read_text(encoding="utf-8-sig")
    assert '<MaskedField Mask="@GetMask()"' in date_source
    for marker in ('new("datefield", "DateField"', 'class="lab-date-grid"',
                   'id="lab-date-day"', 'id="lab-date-month"', 'id="lab-date-only"',
                   'id="lab-date-disabled"', 'Mode="CalendarMode.MonthSelect"',
                   'DisplayCalendar="false"', 'SelectedDateFieldRazor'):
        assert marker in source, "Current DateField real specimen missing: "+marker
    assert '.lab-canvas.narrow .lab-date-grid' in css
    assert '.lab-canvas.compact .lab-date-card' in css
    assert '.lab-canvas[dir="rtl"] .lab-date-card p { text-align:right; }' in css
    date_queue=next(e for e in json.loads(QUEUE.read_text(encoding="utf-8-sig"))["families"]
                    if e["family"]=="DateField")
    assert date_queue["scenarioId"]=="datefield-day-month-dateonly-disabled"
    for gate in (
        "twelfth DateField renders current real masked day month DateOnly and disabled fields",
        "DateField current MaskedField native values day month DateOnly and truly disabled render",
        "DateField calendar trigger only appears for enabled day picker sample",
        "native date input mask keypress updates actual DateTime Blazor value to 2026/10/19",
        "disabled DateField actual MaskedField input rejects focus and preserves date",
        "DateField copyable Razor has native day MonthSelect DateOnly and disabled samples",
        "RTL 320px DateField four cards render in one nonoverlapping column with >=8px gap",
        "RTL DateField English status punctuation retains LTR but right alignment",
        "source queue #438 retains DateField Backlog and offers runnable current pilot",
        "source queue launches twelfth real DateField without completing #438",
    ):
        assert gate in (ROOT/"scripts/quality/probe_v3_component_lab.mjs").read_text(encoding="utf-8-sig")
    assert data["families"][10]["id"] == "selectfield"
    assert data["families"][10]["classification"] == "representative_only"
    assert data["families"][10]["existingDemoRoute"] == "/components/fields"
    assert set(data["families"][10]["propertiesDemonstrated"]) == {
        "Value", "ValueChanged", "ChildContent", "disabled"
    }
    sel_source=(ROOT/"src/Bluent.UI/Components/SelectFieldComponent/SelectField.razor").read_text(encoding="utf-8-sig")
    assert "<select @attributes=GetInputAdditionalAttributes()" in sel_source
    assert '@onchange="OnValueChanged"' in sel_source
    for tag in ('new("selectfield", "SelectField"', 'class="lab-select-grid"',
                'id="lab-select-color"', 'id="lab-select-priority"', 'id="lab-select-disabled"',
                'SelectedSelectFieldRazor', 'role="status" lang="en" dir="ltr"'):
        assert tag in source, "11th SelectField source sample absent: "+tag
    assert '.lab-canvas.narrow .lab-select-grid' in css
    assert '.lab-canvas.compact .lab-select-card' in css
    assert '.lab-canvas[dir="rtl"] .lab-select-card p { text-align:right; }' in css
    select_queue=next(e for e in json.loads(QUEUE.read_text(encoding="utf-8-sig"))["families"]
                      if e["family"]=="SelectField")
    assert select_queue["scenarioId"]=="select-field-string-int-native-disabled"
    for gate in (
        "eleventh current SelectField renders real native generic HTML select in Lab",
        "SelectField real string blue int two and native disabled select initial values",
        "native ArrowDown changes SelectField string ValueChanged and Blazor status to Green",
        "native ArrowUp parses generic SelectField int ValueChanged and updates Blazor model",
        "native disabled SelectField rejects focus and preserves selected option",
        "SelectField copyable Razor includes string int selected options and disabled",
        "RTL 320px SelectField cards are one full-width column with >=8px real separation",
        "RTL SelectField English statuses keep LTR punctuation and right alignment",
        "source queue #437 points to incomplete SelectField plus live pilot link",
        "source queue launches 11th real SelectField without claiming #437 Done",
    ):
        assert gate in (ROOT/"scripts/quality/probe_v3_component_lab.mjs").read_text(encoding="utf-8-sig")
    assert data["families"][9]["id"] == "radio"
    assert data["families"][9]["classification"] == "representative_only"
    assert data["families"][9]["existingDemoRoute"] == "/components/radios"
    assert set(data["families"][9]["propertiesDemonstrated"]) == {
        "Value", "ValueChanged", "Label", "Orientation",
        "ItemsLabelPosition", "Radio.Value", "Radio.Label", "disabled"
    }
    src_radio = (ROOT/"src/Bluent.UI/Components/RadioGroupComponent/Radio.razor").read_text(encoding="utf-8-sig")
    src_group = (ROOT/"src/Bluent.UI/Components/RadioGroupComponent/RadioGroup.razor.cs").read_text(encoding="utf-8-sig")
    assert 'type="radio"' in src_radio and "SetValue(object? value)" in src_group
    for marker in ('new("radio", "RadioGroup"', 'class="lab-radio-grid"',
                   'Id="lab-radio-am"', 'Id="lab-radio-pm"',
                   'Id="lab-radio-high"', 'Id="lab-radio-disabled"',
                   'ItemsLabelPosition="LabelPosition.Before"', 'SelectedRadioRazor'):
        assert marker in source, "RadioGroup current public API sample missing: "+marker
    assert '.lab-canvas.narrow .lab-radio-grid' in css
    assert '.lab-canvas.compact .lab-radio-card' in css
    for label in ("lab-radio-status","lab-radio-vertical-status","lab-radio-restricted-status"):
        assert f'class="{label}" role="status" lang="en" dir="ltr"' in source
    assert '.lab-canvas[dir="rtl"] .lab-radio-card p { text-align:right; }' in css
    assert "RTL Radio English statuses keep LTR punctuation and align right within spaced cards" in (ROOT/"scripts/quality/probe_v3_component_lab.mjs").read_text(encoding="utf-8-sig")
    radio_queue=next(e for e in json.loads(QUEUE.read_text(encoding="utf-8-sig"))["families"]
                     if e["family"]=="RadioGroup")
    assert radio_queue["scenarioId"] == "radio-group-choice-orientation-disabled"
    for proof in (
        "tenth RadioGroup and Radio render current native input family",
        "RadioGroup current initial selected vertical label-before and disabled states render",
        "native Space selects Morning radio and changes RadioGroup Blazor string binding",
        "Afternoon real radio indicator has hit-tested native pointer geometry",
        "native indicator pointer selects Afternoon and unchecks Morning in current RadioGroup",
        "vertical RTL-ready radio indicator is a real pointer target",
        "vertical LabelPosition Before radio changes typed group Value with native pointer",
        "disabled real radio refuses native focus and leaves bound group unselected",
        "disabled radio indicator pointer hit-test still targets the real option",
        "native click on disabled radio indicator never updates Blazor group",
        "copyable RadioGroup source has bind Value Orientation LabelPosition and disabled",
        "RTL Radio English statuses keep LTR punctuation and align right within spaced cards",
        "RTL 320px RadioGroup cards have one column and at least 8px real separation",
        "queue #436 correctly retains incomplete RadioGroup and runnable pilot link",
        "queue launches tenth real RadioGroup pilot without completing product issue",
    ):
        assert proof in (ROOT/"scripts/quality/probe_v3_component_lab.mjs").read_text(encoding="utf-8-sig")
    assert data["families"][8]["id"] == "numeric"
    assert data["families"][8]["classification"] == "representative_only"
    assert data["families"][8]["existingDemoRoute"] == "/components/fields"
    assert set(data["families"][8]["propertiesDemonstrated"]) == {
        "Value", "ValueChanged", "BindValueEvent", "Min", "Max",
        "Format", "OnFocus", "OnBlur", "disabled"
    }
    nf=(ROOT/"src/Bluent.UI/Components/NumericFieldComponent/NumericField.razor.cs").read_text(encoding="utf-8-sig")
    assert all(x in nf for x in ("public TValue? Min", "public TValue? Max",
                              "public string? Format", "public EventCallback OnFocus",
                              "public EventCallback OnBlur"))
    for marker in ('new("numeric", "NumericField"', 'class="lab-numeric-grid"',
                   'id="lab-numeric-live"', 'id="lab-numeric-decimal"',
                   'id="lab-numeric-disabled"', 'SelectedNumericRazor',
                   'OnFocus="NumericFocusedAsync"', 'OnBlur="NumericBlurredAsync"'):
        assert marker in source, "NumericField actual API pilot missing: "+marker
    assert '.lab-canvas.narrow .lab-numeric-grid' in css
    assert '.lab-canvas.compact .lab-numeric-card' in css
    numeric_queue=next(e for e in json.loads(QUEUE.read_text(encoding="utf-8-sig"))["families"]
                       if e["family"]=="NumericField")
    assert numeric_queue["scenarioId"] == "numeric-integer-decimal-bounds-focus-disabled"
    for proof in (
        "ninth NumericField renders existing live generic Blazor numeric input",
        "NumericField integer five decimal formatted and native disabled real inputs render",
        "native focus invokes current NumericField OnFocus exactly once",
        "native NumericField text entry changes integer ValueChanged via Blazor oninput",
        "leaving actual NumericField emits OnBlur exactly once",
        "numeric disabled property rejects focus and preserves its value",
        "NumericField copyable source preserves Min Max Format oninput and focus handlers",
        "RTL 320px NumericField source cards have a real single column and nonzero gaps",
        "source queue #433 points to incomplete NumericField issue and its live demo",
        "source queue launches ninth real NumericField pilot without completing #433",
    ):
        assert proof in (ROOT/"scripts/quality/probe_v3_component_lab.mjs").read_text(encoding="utf-8-sig")
    assert data["families"][7]["id"] == "switch"
    assert data["families"][7]["classification"] == "representative_only"
    assert data["families"][7]["existingDemoRoute"] == "/components/fields"
    assert set(data["families"][7]["propertiesDemonstrated"]) == {
        "Value", "ValueChanged", "Label", "UncheckedLabel", "LabelPosition", "disabled"
    }
    switch_source = (ROOT/"src/Bluent.UI/Components/SwitchComponent/Switch.razor").read_text(encoding="utf-8-sig")
    assert "@inherits Checkbox<bool>" in switch_source
    for x in ('new("switch", "Switch"', 'class="lab-switch-grid"',
              'id="lab-switch-primary"', 'id="lab-switch-before"',
              'id="lab-switch-disabled"', 'LabelPosition="LabelPosition.Before"',
              'SelectedSwitchRazor'):
        assert x in source, "Source-backed Switch preview missing: "+x
    assert '.lab-canvas.narrow .lab-switch-grid' in css
    assert '.lab-canvas.compact .lab-switch-card' in css
    switch_queue = next(e for e in json.loads(QUEUE.read_text(encoding="utf-8-sig"))["families"]
                        if e["family"] == "Switch")
    assert switch_queue["scenarioId"] == "switch-bool-label-before-disabled"
    for proof in (
        "eighth Switch pilot renders actual Bluent input family through interactive catalog",
        "Switch current native off label-before and disabled true states render",
        "native Space on current Switch toggles true and updates label plus Blazor model",
        "second native Space returns Switch to off without stale label or value",
        "current disabled Switch rejects native focus and remains checked",
        "disabled Switch indicator has native pointer hit-test inside component",
        "hit-tested native pointer cannot toggle disabled public Switch",
        "generated Switch Razor contains two bind Value models before-label and disabled",
        "source queue #435 links incomplete Switch and provides real pilot launch",
        "source queue launches eighth Switch specimen without completing #435",
    ):
        assert proof in (ROOT/"scripts/quality/probe_v3_component_lab.mjs").read_text(encoding="utf-8-sig")

    assert data["families"][6]["id"] == "checkbox"
    assert data["families"][6]["classification"] == "representative_only"
    assert data["families"][6]["existingDemoRoute"] == "/components/checkboxes"
    assert set(data["families"][6]["propertiesDemonstrated"]) == {
        "Value", "ValueChanged", "Label", "IndeterminateLabel", "disabled"
    }
    cb_file = ROOT/"src/Bluent.UI/Components/CheckBoxComponent/Checkbox.razor.cs"
    actual_checkbox = cb_file.read_text(encoding="utf-8-sig")
    assert "public string? IndeterminateLabel" in actual_checkbox
    assert "public string? Label" in actual_checkbox
    assert "public void Toggle()" in actual_checkbox
    for x in ('new("checkbox", "Checkbox"', 'class="lab-checkbox-grid"',
              'id="lab-cb-checked"', 'id="lab-cb-nullable"',
              'id="lab-cb-disabled"', 'SelectedCheckboxRazor'):
        assert x in source, "Current Checkbox live specimen missing: "+x
    assert '.lab-canvas.narrow .lab-checkbox-grid' in css
    assert '.lab-canvas.compact .lab-checkbox-card' in css
    checkbox_queue = next(e for e in json.loads(QUEUE.read_text(encoding="utf-8-sig"))["families"]
                          if e["family"] == "Checkbox")
    assert checkbox_queue["scenarioId"] == "checkbox-bool-nullable-disabled"
    for proof in (
        "seventh Checkbox family renders real Bluent checkbox through interactive search",
        "Checkbox real unchecked indeterminate nullable and disabled checked states exist",
        "native Space on real Checkbox toggles bool and updates Blazor binding",
        "native Space changes nullable indeterminate Checkbox to checked bool true",
        "native disabled Checkbox cannot receive keyboard focus or drop its checked state",
        "disabled Checkbox has a real pointer hit target inside its own disabled container",
        "real hit-tested pointer cannot toggle public disabled Checkbox",
        "Checkbox generated Razor contains true bool nullable indeterminate and disabled API",
        "source queue #434 links unfinished Checkbox issue and its actual runnable pilot",
        "source queue launches seventh current Checkbox specimen without falsely completing #434",
    ):
        assert proof in (ROOT/"scripts/quality/probe_v3_component_lab.mjs").read_text(encoding="utf-8-sig")

    assert data["families"][5]["id"] == "textfield"
    assert data["families"][5]["existingDemoRoute"] == "/components/fields"
    assert data["families"][5]["classification"] == "representative_only"
    actual_tf = (ROOT/"src/Bluent.UI/Components/TextFieldComponent/TextField.razor.cs").read_text(encoding="utf-8-sig")
    base_field = (ROOT/"src/Bluent.UI/Components/BluentFieldComponentBase.cs").read_text(encoding="utf-8-sig")
    assert all(f"public {kind}" in actual_tf for kind in ("int? Rows", "bool ResizeTextarea"))
    assert 'public string BindValueEvent' in base_field
    for expected_gate in (
        "sixth TextField family is a live current Bluent field in filtered catalog",
        "TextField real input textarea Rows 3 no-resize and native disabled render",
        "native Chromium text entry updates TextField oninput ValueChanged Blazor binding",
        "TextField native label focuses current field and disabled input remains unfocusable",
        "sixth TextField copyable Razor includes live oninput textarea disabled and state",
        "source queue launches sixth real TextField preview from issue 432",
    ):
        assert expected_gate in (ROOT/"scripts/quality/probe_v3_component_lab.mjs").read_text(encoding="utf-8-sig")
    assert set(data["families"][5]["propertiesDemonstrated"]) == {
        "Value", "ValueChanged", "BindValueEvent", "Rows", "ResizeTextarea", "disabled"
    }
    for marker in ('new("textfield", "TextField"', 'class="lab-textfield-grid"',
                   'id="lab-tf-input"', 'id="lab-tf-notes"', 'id="lab-tf-disabled"',
                   'BindValueEvent="oninput"', 'Rows="3"', 'ResizeTextarea="false"',
                   'SelectedTextFieldRazor', '52</strong> not yet demonstrated'):
        assert marker in source, "Live current TextField specimen contract missing: " + marker
    assert '.lab-canvas.narrow .lab-textfield-grid' in css
    assert '.lab-canvas.compact .lab-textfield-card' in css
    q = (ROOT/"docs/v3/quality/COMPONENT-LAB-FAMILY-QUEUE.json")
    textfield_queue = next(e for e in json.loads(q.read_text(encoding="utf-8-sig"))["families"]
                           if e["family"] == "TextField")
    assert textfield_queue["scenarioId"] == "textfield-input-textarea-disabled"
    assert all(f["classification"]=="representative_only" for f in data["families"])

    assert len({entry["id"] for entry in data["families"]}) == 18
    assert '@page "/component-lab"' in source
    assert 'Href="component-lab"' in menu
    assert '@bind:event="oninput"' in source
    for feature in ('id="lab-direction"', 'id="lab-viewport"', 'id="lab-density"',
                    'id="lab-contrast"', 'dir="@_direction"', 'CopySourceAsync',
                    'role="status"', 'aria-pressed=', 'navigator.clipboard.writeText'):
        assert feature in source, f"pilot control missing: {feature}"
    assert 'global theme' in source, "canvas preview MUST not impersonate real app theme"
    assert "max-width:320px" in css and "prefers-reduced-motion:reduce" in css
    for token in ('id="lab-icon-value"', 'id="lab-icon-variant"',
                  'Enum.GetValues<IconVariant>()', 'Variant="@_iconVariant"',
                  'Class="lab-selected-icon"', 'SelectedIconRazor',
                  'id="lab-label-size"', 'id="lab-label-required"',
                  'Enum.GetValues<LabelSize>()', 'Enum.GetValues<LabelRequiredState>()',
                  'ForExpression="() => LabEmail"', 'Size="@_labelSize"',
                  'Required="@_labelRequired"', 'RequiredSymbol="!"',
                  'id="LabEmail"', '[Required] public string LabEmail',
                  '<Info>', 'Use a work email for contact.', 'SelectedLabelRazor'):
        assert token in source, "missing source-backed Icon/Label pilot: "+token
    assert ".lab-api-controls" in css and ".lab-form-example input:focus" in css
    assert ".lab-form-example input:focus-visible { outline:" not in css, "native illustrative input must use underline focus, not unwanted full ring"

    # Research fixture only: public Color variant belongs to Backlog #429.
    color_fixture=(ROOT/"src/Bluent.UI.Demo.Pages/Pages/Components/ComponentLabColorApps.cs")
    fixture=color_fixture.read_text(encoding="utf-8")
    assert "MIT @fluentui/svg-icons 1.1.344" in fixture
    assert "IconDefinition.FromSvg" in fixture
    assert fixture.count("<linearGradient id=") == 4
    assert "ComponentLabColorApps.Preview" in source
    assert "public IconVariant.Color is proposed in #429, not implemented" in source
    assert "@media (forced-colors: active)" in css
    assert ".lab-color-research ::deep .lab-color-preview-icon" in css
    assert ".lab-color-research ::deep .lab-color-preview-monochrome" in css
    assert "Color" not in (ROOT/"src/Bluent.UI/Icons/IconVariant.cs").read_text(encoding="utf-8")
    for gate in ("genuine MIT Fluent Color SVG renders four scoped gradients; demo explicitly labels API unavailable",
                 "default OS mode displays true Color SVG and hides monochrome fallback",
                 "Chromium emulated forced-colors media hides gradients and shows Filled source",
                 "leaving forced-colors restores exact original Color and hides Filled fallback"):
        assert gate in (ROOT/"scripts/quality/probe_v3_component_lab.mjs").read_text(encoding="utf-8")


    for entry in data["families"]:
        assert entry["classification"] == "representative_only"
        modes=entry["renderModesVerified"]
        assert len(modes)==4, "Chrome/Edge x WASM/Server pilot evidence required"
        assert modes[0].startswith("Chrome/WebAssembly Dev01:")
        assert modes[1].startswith("Edge/WebAssembly Dev01:")
        assert modes[2].startswith("Chrome/Server Dev01:")
        assert modes[3].startswith("Edge/Server Dev01:")
        for i,mode in enumerate(modes):
            if entry["id"] == "badge":
                assert "Badge CDP" in mode, "Do not infer Badge OS/AT acceptance from a pilot"
                continue
            if entry["id"] == "file":
                if i < 2:
                    assert "real native synthetic InputFile single/multiple selection, OnChange and Card remove 228/228 PASS" in mode
                else:
                    assert "published InteractiveServer real synthetic InputFile selection + binding + removal 224/224 PASS" in mode
                continue
            if entry["id"] == "range":
                if i < 2:
                    assert "217/217 PASS including CDP pointer updates ValueRange<int> and ValueRange<decimal>" in mode
                else:
                    assert "213/213 PASS for rendering" in mode
                    assert "pointer binding deliberately NOT asserted" in mode
                continue
            if entry["id"] == "slider":
                if i < 2:
                    assert "real 208/208 PASS incl Slider CDP pointer ValueChanged" in mode
                else:
                    assert "206/206 PASS render/layout only" in mode
                    assert "pointer mutation not verified" in mode
                continue
            if entry["id"] == "otp":
                assert "real 199/199 Chrome DevTools Protocol assertions PASS including OTP" in mode
                continue
            if entry["id"] in ("textfield","checkbox","switch","numeric","radio","selectfield","datefield","timefield","masked"):
                assert ("TextField native Blazor browser" if entry["id"] == "textfield" else "Checkbox native Blazor browser" if entry["id"] == "checkbox" else "Switch native Blazor browser" if entry["id"] == "switch" else "NumericField native Blazor browser" if entry["id"] == "numeric" else "RadioGroup native Blazor browser" if entry["id"] == "radio" else "SelectField native Blazor browser" if entry["id"] == "selectfield" else "DateField native Blazor browser" if entry["id"] == "datefield" else "TimeField native Blazor browser" if entry["id"] == "timefield" else "real native source browser 187/187 PASS incl #440 MaskedField") in mode
                continue
            assert "shared browser smoke 27/27" in mode
            if entry["id"] in ("button", "icon"):
                assert "interactive controls observed" in mode
            else:
                assert "native rendered markup observed" in mode
        assert entry["source"] == str(LAB.relative_to(ROOT)).replace("\\", "/")
        assert entry["labRoute"] == "/component-lab"
        demo_file = {"textfield": "Fields.razor", "checkbox": "Checkboxes.razor", "switch": "Fields.razor", "numeric": "Fields.razor", "radio": "Radios.razor", "selectfield": "Fields.razor", "datefield": "Fields.razor", "timefield": "Fields.razor", "masked": "Fields.razor", "otp": "Fields.razor", "slider": "Sliders.razor", "range": "Sliders.razor", "file": "FileSelects.razor"}.get(entry["id"],entry["family"]+"s.razor")
        demo_path = ROOT / "src/Bluent.UI.Demo.Pages/Pages/Components" / demo_file
        assert demo_path.exists(), f"missing referenced demo: {demo_path}"
        assert f'@page "{entry["existingDemoRoute"]}"' in demo_path.read_text(encoding="utf-8-sig")
        assert f'new("{entry["id"]}", "{entry["family"]}"' in source
        assert entry["scenarioId"] and entry["propertiesDemonstrated"] and entry["remaining"]
    # Real existing-API Button enum selectors and synchronized Razor source.
    for token in ('id="lab-button-appearance"', 'id="lab-button-size"',
                  'id="lab-button-shape"', 'Enum.GetValues<ButtonAppearance>()',
                  'Enum.GetValues<ButtonSize>()', 'Enum.GetValues<ButtonShape>()',
                  'Appearance="@_buttonAppearance"', 'Size="@_buttonSize"',
                  'Shape="@_buttonShape"', 'ActiveRazor',
                  'Toggled="@_buttonToggled"', 'ToggledChanged="ButtonToggledAsync"',
                  'Href="getting-started"', 'class="lab-click-status"',
                  'class="lab-toggle-status"', 'private Task ButtonToggledAsync(bool toggled)',
                  'SecondaryText="Recent activity"', 'Compact="true"',
                  'BadgeHorizontalPosition="HorizontalSides.End"',
                  'BadgeVerticalPosition="VerticalSides.Bottom"',
                  'ShowDropdownIndicator="true"', 'DropdownPlacement="Placement.BottomEnd"',
                  'MenuItem Title="Export report"', 'MenuItem Title="Share summary"',
                  'class="lab-menu-status"', 'private Task ChooseExportAsync()',
                  'private Task ChooseShareAsync()'):
        assert token in source, f"Button runtime explorer/source missing: {token}"
    assert all(x in data["families"][0]["propertiesDemonstrated"]
               for x in ("Appearance", "Size", "Shape", "Toggled", "ToggledChanged", "Href",
                         "SecondaryText", "Compact", "Badge", "BadgeHorizontalPosition",
                         "BadgeVerticalPosition", "Dropdown", "ShowDropdownIndicator",
                         "DropdownPlacement"))
    assert set(data["families"][4]["propertiesDemonstrated"]) == {
        "Appearance", "Size", "Shape", "Color", "Icon", "Text", "DropShadow", "AnimateShadow"
    }
    badge_source = (ROOT/"src/Bluent.UI/Components/BadgeComponent/Badge.razor.cs").read_text(encoding="utf-8-sig")
    badge_parameters = set(re.findall(
        r"\[Parameter\]\s+public\s+[^\r\n{]+?\s+(\w+)\s*\{\s*get\s*;",
        badge_source))
    badge_represented = set(data["families"][4]["propertiesDemonstrated"])
    assert len(badge_parameters) == 8 and badge_parameters == badge_represented, (
        "Badge source public parameter drift: "
        +str({"missing": sorted(badge_parameters-badge_represented),
              "stale": sorted(badge_represented-badge_parameters)}))
    assert len(data["families"][0]["propertiesDemonstrated"])==21, "20 of 20 native [Parameter] names plus disabled additional attribute"
    # Fail closed if the REAL exported Button API changes. Do not freeze a
    # misleading "20/20" count based solely on the ledger's own entries.
    actual_button = (ROOT/"src/Bluent.UI/Components/ButtonComponent/Button.razor.cs").read_text(encoding="utf-8-sig")
    actual_parameters = set(re.findall(
        r"\[Parameter\]\s+public\s+[^\r\n{]+?\s+(\w+)\s*\{\s*get\s*;",
        actual_button))
    represented = set(data["families"][0]["propertiesDemonstrated"])-{"disabled"}
    assert len(actual_parameters)==20 and represented==actual_parameters, (
        "Declared public Button parameters drifted from representative Lab scenarios: "
        +str({"missing":sorted(actual_parameters-represented),
              "stale":sorted(represented-actual_parameters)}))

    for proof in ("live Button explorer uses source-backed default enum values",
                  "real Bluent Button responds to dynamic Danger/Large/Square parameters",
                  "generated Razor example matches all three selected Button values",
                  "public Toggled Button starts untoggled with zero EventCallback notifications",
                  "native keyboard Enter sets public Toggled state and invokes ToggledChanged once",
                  "native second Enter reverts Toggled state with exactly second callback",
                  "public Button Href renders native anchor with a real destination",
                  "copyable source reflects existing Button toggle callback and Href contracts",
                  "native Button Compact Compound Badge and end/bottom positions render",
                  "existing Dropdown Button exposes native focusable indicator trigger",
                  "native keyboard Enter opens actual Dropdown MenuList with two choices",
                  "real Export report menu click invokes exactly one Blazor callback",
                  "real Share summary menu click invokes exactly a second callback",
                  "copyable Razor includes badge/menu source and backing event handlers"):
        assert proof in (ROOT/"scripts/quality/probe_v3_component_lab.mjs").read_text(encoding="utf-8")
    # The public Split Button combines an independent OnClick with Dropdown.
    # A demo is useful for #428 work, but is NOT full native AT approval.
    for needle in ('class="lab-advanced-group lab-split-action"', 'Text="Send now"',
                   'OnClick="ChooseSplitPrimaryAsync"',
                   'MenuItem Title="Schedule send" OnClick="ChooseSplitScheduleAsync"',
                   'private Task ChooseSplitPrimaryAsync()',
                   'private Task ChooseSplitScheduleAsync()'):
        assert needle in source, "existing Split Button live sample missing: "+needle
    for label in (
        "actual current public Split Button mounts independent primary and disclosure buttons",
        "native Enter on Split primary invokes only primary callback once",
        "native Enter on Split secondary opens Dropdown without primary callback",
        "real Split menu pointer action invokes only scheduled callback once",
        "copyable existing Split Button Razor includes both real event handlers",
    ):
        assert label in (ROOT/"scripts/quality/probe_v3_component_lab.mjs").read_text(
            encoding="utf-8-sig"
        ), "missing Split Button runtime browser gate: "+label
    # Existing Split Button native-disabled state must be a real Blazor
    # specimen, not an image, and never be reported as v3 AT acceptance.
    for literal in ('class="lab-advanced-group lab-split-disabled"',
                    'Text="Send disabled"',
                    'MenuItem Title="Schedule disabled" OnClick="ChooseSplitScheduleAsync"'):
        assert literal in source, "Missing disabled Split Button specimen: "+literal
    for label in (
        "existing disabled Split Button disables both native primary and disclosure",
        "native Enter cannot focus or activate disabled Split primary",
        "native Enter cannot focus or open disabled Split disclosure",
        "pointer clicks within both disabled Split button bounds remain inert",
        "copyable disabled Split Razor passes native disabled attribute to both actions",
    ):
        assert label in (ROOT/"scripts/quality/probe_v3_component_lab.mjs").read_text(
            encoding="utf-8-sig"
        ), "Missing disabled Split native browser guard: "+label
    # All four advanced cards must live inside one responsive CSS Grid.
    # This protects spacing in both RTL 320px preview and desktop.
    start = source.index('class="lab-advanced-actions"')
    end = source.index('class="lab-orientation-examples"', start)
    assert source[start:end].count('class="lab-advanced-group') == 4
    css = (ROOT/"src/Bluent.UI.Demo.Pages/Pages/Components/ComponentLab.razor.css").read_text(encoding="utf-8-sig")
    assert '.lab-advanced-actions { display:grid;' in css
    assert 'gap:.75rem;' in css
    assert '.lab-canvas.narrow .lab-advanced-actions { grid-template-columns:minmax(0,1fr); }' in css
    assert '.lab-canvas.narrow .lab-orientation-examples,' in css
    assert '.lab-canvas.narrow .lab-api-controls { grid-template-columns:minmax(0,1fr); }' in css
    assert 'RTL 320px preview Orientation and Rotated cards stack without overlap' in (ROOT/"scripts/quality/probe_v3_component_lab.mjs").read_text(encoding="utf-8-sig")
    assert 'RTL 320px Icon API controls are one full-width column with visible gap' in (ROOT/"scripts/quality/probe_v3_component_lab.mjs").read_text(encoding="utf-8-sig")
    assert '.lab-canvas.compact :is(.lab-advanced-actions,.lab-orientation-examples,.lab-api-controls) { gap:.5rem; }' in css
    assert '.lab-canvas.compact :is(.lab-advanced-group,.lab-orientation-group) { gap:.375rem; padding:.625rem; }' in css
    assert '.lab-canvas.compact .lab-api-demo { gap:.5rem; padding:.625rem; }' in css
    for name in (
        'RTL 320px compact density reduces advanced and Orientation card spacing without touching',
        'returning to default density restores full 12px advanced and Orientation gutters',
        'compact RTL 320px Icon API controls keep an 8px gutter with reduced padding',
    ):
        assert name in (ROOT/"scripts/quality/probe_v3_component_lab.mjs").read_text(encoding="utf-8-sig")
    for label in (
        'desktop advanced Button cards have clear grid row and column spacing',
        'RTL narrow preview advanced Button cards retain visible vertical spacing',
    ):
        assert label in (ROOT/"scripts/quality/probe_v3_component_lab.mjs").read_text(encoding="utf-8-sig"), "missing actual browser card-spacing regression: "+label
    # In RTL samples, keep English specimen text LTR for punctuation,
    # while aligning labels with the canvas RTL edge.
    for cls in ('lab-advanced-label','lab-menu-status',
                'lab-split-status','lab-split-disabled-help'):
        assert f'class="{cls}" dir="ltr" lang="en"' in source
    assert '.lab-canvas[dir="rtl"] .lab-advanced-group > :is(' in css
    for label in (
        'RTL advanced specimen English captions retain LTR punctuation and right alignment',
        'LTR advanced specimen captions keep natural left text alignment',
    ):
        assert label in (ROOT/"scripts/quality/probe_v3_component_lab.mjs").read_text(encoding="utf-8-sig")
    # Actual Chrome/Edge launch must fail closed. Cold Windows CI may need
    # >20s to start the CDP debug server when 8 parallel jobs compete.
    browser_probe=(ROOT/"scripts/quality/probe_v3_component_lab.mjs").read_text(encoding="utf-8")
    assert "'DevToolsActivePort'" in browser_probe and "},60000);" in browser_probe
    assert "if(!tab)throw Error('Missing temporary Chrome page')" in browser_probe
    # Real existing Button API final four parameter-name specimens.
    for label in ("TextClass", "Icon", "Rotated", "Orientation"):
        assert label in data["families"][0]["propertiesDemonstrated"], label
    for needle in ('id="lab-button-vertical"', 'id="lab-button-rotated"',
                   'TextClass="lab-custom-button-text"', 'Icon="@FluentIcons.Settings"',
                   'Icon="@FluentIcons.Search"', 'Orientation="Orientation.Vertical"',
                   'Rotated="true"', 'class="lab-orientation-examples"'):
        assert needle in source, "Missing native Button API specimen: "+needle
    for needle in ("real Bluent Button", "native Tab"):
        assert needle in (ROOT/"scripts/quality/probe_v3_component_lab.mjs").read_text(encoding="utf-8")
    for needle in (".lab-orientation-examples", ".lab-custom-button-text"):
        assert needle in css

    generated=(ROOT/"src/Bluent.UI.Demo.Pages/Pages/Components/ComponentLabFamilyQueue.g.cs")
    assert generated.is_file() and generated.read_text(encoding="utf-8-sig")==generated_ui_queue()
    assert "#nullable enable" in generated.read_text(encoding="utf-8")
    for token in ("Component implementation queue", 'id="lab-queue-search"',
                  "ComponentLabFamilyQueue.All.Where", "Live pilot · incomplete",
                  "Queued · no lab scenario", "https://github.com/vrassouli/Bluent/issues/"):
        assert token in source, token
    assert ".lab-queue-row" in css and ".lab-queue-list" in css
    queue = json.loads(QUEUE.read_text(encoding="utf-8"))
    assert queue == expected_full_queue(), "66-family queue must match canonical #494 census"
    assert queue["familyCount"] == 66 and queue["familiesWithRepresentativeLabScenario"] == 18
    assert queue["familiesWithRealBrowserSpecimen"] == 16
    assert queue["apiCoverageComplete"] is False
    assert [item["issue"] for item in queue["families"]] == list(range(428, 494))
    assert not any(item["completeDemoAcceptance"] or item["componentDesignAccepted"] or
                   item["browserMatrixAccepted"] or item["apiPropertiesEventsMapped"]
                   for item in queue["families"])
    for item in queue["families"]:
        assert all((ROOT / f).is_file() for f in item["candidateSourceFiles"])
        assert all((ROOT / f).is_file() for f in item["existingDocumentationFiles"])
        assert all((ROOT / f).is_file() for f in item["existingConsumerExampleFiles"])
    probe=(ROOT / "scripts/quality/probe_v3_component_lab.mjs").read_text(encoding="utf-8-sig")
    for literal in ("Badge real source component renders default Filled Medium Circular Brand and no icon/shadow",
                    "Badge actual Appearance Size Shape Color Text parameters rebind source CSS and content",
                    "Badge Icon DropShadow AnimateShadow are real live rendered public parameters",
                    "Badge copyable Razor contains all eight actual public parameter names and live enum values",
                    "Badge AnimateShadow without DropShadow does not emit animated shadow class",
                    "for(const family of ['Label','Link'])",
                    "native accessible markup",
                    "markup.tag==='label'",
                    "markup.tag==='a'",
                    "mobile 320px viewport has no unintended horizontal document clipping",
                    "canonical 66 candidate rows include eighteen incomplete real lab pilots",
                    "issue 432 search finds current TextField pilot without claiming completion",
                    "source queue opens actual previously tested Button specimen",
                    "full 66-family queue reflows without document overflow at 320px"):
        assert literal in probe, f"real-browser probe regression: {literal}"
    flow=(ROOT/".github/workflows/v3-component-lab.yml").read_text(encoding="utf-8-sig")
    owner=(ROOT/"scripts/quality/run_v3_component_lab.ps1").read_text(encoding="utf-8-sig")
    assert "browser: [Chrome, Edge]" in flow
    assert "matrix.browser" in flow and "msedge.exe" in flow
    # Per-run prefix prevents concurrent QA owners from cross-killing.
    for marker in ('$qaRunId = [guid]::NewGuid().ToString("N")',
                   '$profilePrefix = "bluent-v3-421-lab-$qaRunId-"',
                   '$env:BLUENT_V3_LAB_PROFILE_PREFIX = $profilePrefix',
                   'TcpListener]::new([Net.IPAddress]::Loopback, 0)',
                   '$_.CommandLine.Contains($profilePrefix)',
                   '-Filter "$profilePrefix*"',
                   '"bluent-v3-421-$qaRunId-stdout.log"'):
        assert marker in owner, f"missing per-run ownership isolation: {marker}"
    assert 'http://127.0.0.1:5280' not in owner
    assert 'http://127.0.0.1:5279' not in owner
    assert 'process.env.BLUENT_V3_LAB_PROFILE_PREFIX' in probe
    assert 'Unsafe QA-owned Chromium profile prefix' in probe
    for cleanup_guard in (
        "for($attempt = 0; $attempt -lt 20; $attempt++)",
        "Start-Sleep -Milliseconds 250",
        "QA owned Chromium cleanup incomplete:",
    ):
        assert cleanup_guard in owner, f"browser teardown must remain bounded and fail closed: {cleanup_guard}"
    assert owner.count("Name='chrome.exe' OR Name='msedge.exe'")==2
    assert "remaining=$($remaining.Count)" in owner
    assert "browserName=/msedge/i.test(chrome)?'Edge':'Chrome';" in probe
    # Actual published Server pilot verified; not full component acceptance.
    server=(ROOT/"src/Bluent.UI.Demo.SSR/Components/Pages/ComponentLabServerProbe.razor").read_text(encoding="utf-8-sig")
    notes=(ROOT/"docs/v3/quality/COMPONENT-LAB-RENDER-MODES.md").read_text(encoding="utf-8-sig")
    assert '@rendermode InteractiveServer' in server and '<ComponentLab />' in server
    assert '<Containers />' in server, "InteractiveServer Lab must host Popover/Tooltip in the same interactive render boundary"
    assert 'data-lab-interactive=' in source and 'OnAfterRenderAsync' in source
    assert 'BLUENT_V3_LAB_MODE' in probe and "renderMode==='Server'" in probe
    assert '[ValidateSet("WebAssembly", "Server")]' in owner
    assert '-Mode Server' in notes and '## Verified pilot: InteractiveServer' in notes
    assert all("Server" in entry["renderModesVerified"][i] for entry in data["families"] for i in (2,3))
    assert "-WorkingDirectory $hostDirectory" in owner
    assert "dotnet build $project --configuration $config --no-restore" in owner,         "WASM runner must rebuild current Razor fixtures, never serve stale Debug binaries"
    assert owner.index("dotnet build $project --configuration") < owner.index("Start-Process dotnet"),         "WASM QA build must precede host process startup"

    assert "framework JavaScript and stylesheet requests have no HTTP failures" in probe
    assert "browser reports no unhandled JavaScript exceptions" in probe
    # After 320px compact/RTL emulation the visual viewport and a nested
    # scrolling ancestor can disagree. Do not bring back window-only
    # scrolling or skip actual native hit-testing when Chrome CI is cold.
    for marker in ("Emulation.clearDeviceMetricsOverride",
                   "innerWidth>=700",
                   "e.scrollHeight>e.clientHeight+2",
                   "e.scrollTop+=y-h/2",
                   "document.elementFromPoint(x,y)",
                   "Copy source target cannot be safely clicked"):
        assert marker in probe, f"missing strict nested scroller/copy-source gate: {marker}"
    for behavior in ("real pointer activation completes Razor Copy source interop",
                     "enabled Bluent Button receives native keyboard focus",
                     "real Enter key activates native Bluent Button exactly once",
                     "disabled Bluent Button cannot receive native focus"):
        assert behavior in probe, f"missing real-browser interaction gate: {behavior}"
    for required_gate in (
        "native Icon Regular default renders a real library source element",
        "public Icon Value dynamically swaps actual CSS or SVG source",
        "public Icon Variant Filled changes actual source class or vector path",
        "Icon copyable Razor tracks current source-owned Value and Variant",
        "official Color SVG and Filled fallback are decorative aria-hidden and never native tab stops",
        "actual Chromium accessibility tree ignores the visible decorative Color SVG",
        "native keyboard Tab bypasses both decorative Icon variants",
        "visible Filled high-contrast fallback remains decorative with readable adjacent label",
        "Label ForExpression binds native input and detects DataAnnotations Required",
        "native pointer activation of Label focuses its exact form input",
        "Label public Size and NotRequired update actual CSS + no symbol",
        "explicit Label Required restores configured symbol",
        "Label copyable Razor includes actual ForExpression Size Required and model annotation",
        "Label public Info renders a focusable native Popover trigger",
        "native keyboard Enter opens actual Label Info Popover content",
        "Label copyable Razor includes nested Info content",
    ):
        assert required_gate in probe, "missing real browser Icon/Label contract: "+required_gate
    # The prototype Color SVG and monochrome HCM alternate are both purely
    # decorative; the real Icon title is adjacent text, not duplicate icon names.
    assert 'Class="lab-color-preview-icon" aria-hidden="true"' in source
    assert 'Class="lab-color-preview-monochrome" aria-hidden="true"' in source
    assert "browser-lab-pilot:" in flow and "mode: [WebAssembly, Server]" in flow
    # #552: Retrospective parity planning is NOT the current API browser smoke.
    # Anchor these 18 historical pilots in the exact canonical issue/source map.
    # A future "verified" claim must carry real reviewed evidence and design approval.
    retro_path = ROOT / "docs/v3/quality/FLUENT-PARITY-RETRO-AUDIT.json"
    retro_doc = ROOT / "docs/v3/quality/FLUENT-PARITY-RETRO-AUDIT.md"
    retro = json.loads(retro_path.read_text(encoding="utf-8"))
    assert retro["schemaVersion"] == 1 and retro["auditIssue"] == 552
    assert retro["epicIssue"] == 416 and retro["labIssue"] == 421
    assert retro["plannedFamilyCount"] == 18 and len(retro["families"]) == 18
    # Maintainer: settle the original 18 Fluent parity debts before family 19.
    assert retro["executionDecision"]["decision"] == "debt_first"
    assert retro["executionDecision"]["newComponentLabFamiliesPaused"] is True
    assert retro["executionDecision"]["firstFocus"] == [
        "Button #428", "Slider #442", "RangeSlider #443", "FileSelect #444"
    ]

    original = data["families"][:18]
    assert [x["family"] for x in retro["families"]] == [x["family"] for x in original]
    live_queue = json.loads(QUEUE.read_text(encoding="utf-8"))["families"]
    issues = {x["family"]: x["issue"] for x in live_queue}
    wave_names = [f for wave in retro["waves"] for f in wave["families"]]
    assert len(wave_names) == 18 and set(wave_names) == {x["family"] for x in original}
    assert all(wave["count"] == len(wave["families"]) for wave in retro["waves"])
    assert len({x["productIssue"] for x in retro["families"]}) == 18
    assert retro["rules"]["separatePilotAndFluentParity"] is True
    assert retro["rules"]["stable2xProtected"] is True
    assert retro["rules"]["changesOnlyTo"] == "bluent-v3"
    assert retro_doc.is_file()
    doc_text = retro_doc.read_text(encoding="utf-8")
    assert "18/18 not reviewed" in doc_text
    assert "0/18 Fluent-approved" in doc_text
    dimensions = {
        "visual", "feature", "behavior", "accessibility", "tokenTheme",
        "responsiveRTL", "BlazorExtensions", "designArtifact", "migrationDocs"
    }
    actually_approved = 0
    for entry in retro["families"]:
        family = entry["family"]
        assert entry["productIssue"] == issues[family]
        assert entry["productIssueUrl"] == f"https://github.com/vrassouli/Bluent/issues/{issues[family]}"
        assert entry["labId"] == next(x["id"] for x in original if x["family"] == family)
        assert entry["wave"] in ("A", "B", "C", "D")
        assert entry["priority"] in ("P0", "P1", "P2")
        assert entry["existingPilotStatus"].startswith("representative_only")
        assert set(entry["dimensions"]) == dimensions
        assert entry["auditStatus"] in retro["rules"]["allowedAuditStatuses"]
        if entry["auditStatus"] == "verified":
            assert entry["designApproval"] == "approved"
            assert entry["editableDesignLocation"] and entry["evidenceBundle"]
            assert entry["fluentReference"]["matchedUpstreamComponent"] != "unverified"
            assert all(v != "not_reviewed" for v in entry["dimensions"].values())
        if entry["designApproval"] == "approved":
            assert entry["editableDesignLocation"]
            actually_approved += 1
    assert retro["noneApproved"] == (actually_approved == 0)
    assert retro["auditComplete"] is False or (
        all(x["auditStatus"] == "verified" for x in retro["families"])
        and not retro["noneApproved"]
    )
    print("Fluent 2 RETRO PLAN PASS: 18/18 original pilot families issue-mapped; "
          "parity approvals remain independent of Component Lab runtime checks")
    print("Component Lab family QUEUE PASS: 66/66 source-mapped, 18 live pilot specimens, ZERO complete components")
    print("Component Lab PILOT contract PASS: 18/18 source-linked families; NOT exhaustive acceptance")
    return 0


if __name__ == "__main__":
    raise SystemExit(check())
