"""Issue #425: every-PR v3 quality gate with non-interchangeable evidence."""
from __future__ import annotations
import re
import xml.etree.ElementTree as ET
from pathlib import Path

ROOT=Path(__file__).resolve().parents[2]
QUALITY=ROOT/".github/workflows/v3-quality-gates.yml"
DOCUMENT=ROOT/"docs/v3/quality/EVIDENCE-AND-GATES.md"
BROWSERS=ROOT/".github/workflows/v3-compatibility-browsers.yml"
BROWSER_PROBE=ROOT/"scripts/quality/probe_v3_compatibility_runtime.mjs"
SSR_PROJ=ROOT/"src/Bluent.UI.Demo.SSR/Bluent.UI.Demo.SSR.csproj"
COMPAT_LAYOUT=ROOT/"src/Bluent.UI.Demo.Interactive.Client/Layout/CompatibilityLayout.razor"
COMPAT_PROBE=ROOT/"src/Bluent.UI.Demo.Interactive.Client/Shared/CompatibilityProbe.razor"

class QualityContractError(ValueError):
    pass

def need(test:bool,message:str)->None:
    if not test: raise QualityContractError(message)

def check(quality:str,document:str)->None:
    for label,content in (("quality",quality),):
        need(re.search(r"(?m)^on:\s*$",content) is not None,label+" missing pull request events")
        trigger=content.split("on:",1)[1]
        for boundary in ("\nconcurrency:","\npermissions:","\njobs:"):
            trigger=trigger.split(boundary,1)[0]
        need("pull_request:" in trigger and
             re.search(r"branches:\s*\[bluent-v3\]",trigger) is not None,
             label+" must run on isolated v3 PRs")
        need("paths:" not in trigger and "paths-ignore:" not in trigger,
             label+" must not silently skip v3 PRs")
        need("continue-on-error: true" not in content,
             label+" must not allow nonblocking test failures")
    for token in ("evidence-contracts:","release-build-test-pack:",
                  "dotnet restore Bluent.sln","dotnet build Bluent.sln",
                  "-warnaserror","dotnet test Bluent.sln","dotnet pack",
                  "release_tools.py validate-packages","check_task_examples.sh",
                  "check_v3_docs_contract.py","check_v3_skill_contract.py",
                  "check_markdown_links.py"):
        need(token in quality,"missing mandatory baseline gate: "+token)
    for project in ("Bluent.Core/Bluent.Core.csproj","Bluent.UI/Bluent.UI.csproj",
                    "Bluent.UI.Charts/Bluent.UI.Charts.csproj",
                    "Bluent.UI.Diagrams/Bluent.UI.Diagrams.csproj",
                    "Bluent.UI.Utilities/Bluent.UI.Utilities.csproj"):
        need(project in quality,"missing package: "+project)
    need("artifacts/v3-evidence/package-validation.json" in quality
         and "actions/upload-artifact@v4" in quality,"pack version and commit evidence missing")
    for forbidden in ("dotnet nuget push","nuget push","gh release create"):
        need(forbidden not in quality.lower(),"QA must never publish: "+forbidden)
    for required in ("dotnet run","Bluent.UI.Demo.SSR.csproj","check_rendered_accessibility.py",
                     "bluent-v3-ssr.log","if: failure()"):
        need(required in quality,"real rendered SSR evidence missing: "+required)
    for label in ("source verified","build verified","pack verified",
                  "runtime verified","visual verified","native OS/AT",
                  "component-specific","unverified"):
        need(label.lower() in document.lower(),"evidence vocabulary missing: "+label)
    need("not an accessibility certification" in document.lower(),
         "emulation is not accessibility certification")

def check_browser_contract(workflow:str, probe:str)->None:
    need(re.search(r"(?m)^on:\s*$",workflow) is not None,"browser workflow must declare triggers")
    trigger=workflow.split("on:",1)[1].split("\npermissions:",1)[0].split("\nconcurrency:",1)[0]
    need("pull_request:" in trigger and "branches: [bluent-v3]" in trigger,
         "browser job must run for v3 PRs")
    need("paths:" not in trigger and "paths-ignore:" not in trigger,
         "browser job cannot skip docs-only PRs")
    need("browser: [Chrome, Edge]" in workflow and "render_mode: [Server, WASM]" in workflow,
         "browser matrix must include Chrome and Edge, Server and WASM")
    for term in ("windows-latest","node-version: \"24\"","fail-fast: false",
                 "probe_v3_compatibility_runtime.mjs","if: always()",
                 "actions/upload-artifact@v4","retention-days: 7"):
        need(term in workflow,"missing actual browser evidence gate: "+term)
    for term in ("Page.captureScreenshot","Input.dispatchKeyEvent",
                 "compatibility-input","bound-value","event-count",
                 "forced-colors","prefers-reduced-motion","const screenshots=",
                 "[320,","[768,","[1280,"):
        need(term in probe,"missing actual browser keyboard/render screenshot contract: "+term)
    for token in ("Accessibility.enable","Accessibility.getFullAXTree",
                  "backendDOMNodeId","DOM.describeNode",
                  "AX tree names real Increment button",
                  "AX tree exposes TextField with Bound value accessible name",
                  "AX tree maps live counter DOM node to status role",
                  "rtl-emulated-contrast.png"):
        need(token in probe,"missing actual browser accessibility-tree evidence: "+token)
    for term in ('node --test scripts/quality/test_v3_png_evidence.mjs',
                 'Exercise real Blazor interactions and capture screenshot evidence'):
        need(term in workflow,"browser PNG evidence integrity contract is required: "+term)
    for term in ('inspectV3Png(bytes,{width,height:820})',
                 'inspectV3Png(contrastBytes,{width:1280,height:820})',
                 'imageEvidence.push','uniqueSampleColors',
                 '7 distinct screenshots captured for intended scenarios'):
        need(term in probe,"browser PNG evidence integrity contract is required: "+term)
    for term in ("headingHostContrast(result.color,result.surface)",
                 "compatibility host foreground-to-surface contrast",
                 "ratio>=4.5","headingBox"):
        need(term in probe,"real theme host contrast and viewport geometry required: "+term)
    for term in ("linkRatio>=4.5","compatibility link text to host contrast",
                 "multiline mobile heading does not overlap",
                 "rows.every((row,i)=>i===0||row.top>=rows[i-1].bottom-.8)",
                 "list.findIndex(item=>Math.abs(item.top-row.top)<.5)===i"):
        need(term in probe,"mobile RTL text/link readability gate required: "+term)
    for term in ("for(const percent of [200,400])",
                 "result.scrollWidth<=321",
                 "result.elements.every(e=>e.exists&&e.width>0&&e.x>=-1&&e.right<=321)",
                 "CSS 200/400 percent text scaling no horizontal clipping"):
        need(term in probe,"actual 200/400% mobile text reflow evidence required: "+term)
    for term in ("keyboard Tab focuses actual Bluent Increment button",
                 "keyboard Tab enables native Button focus-visible modality",
                 "Enter invokes actual Bluent Button callback exactly once",
                 "real pointer targets editable field label before Button",
                 "pointer click transfers native focus to TextField",
                 "real pointer hit test targets Increment button",
                 "real pointer activates Bluent Button exactly once",
                 "real pointer does not masquerade as keyboard Button focus-visible",
                 "Input.dispatchMouseEvent", "document.elementFromPoint",
                 "window.scrollTo({top:0,left:0,behavior:'instant'})"):
        need(term in probe,"native keyboard/pointer modality regression gate: "+term)
    for term in ("probe_v3_native_site_zoom.mjs",
                 "BLUENT_V3_ZOOM_APP_URL",
                 "native site zoom ",
                 "actual Chromium 200/400 native zoom has two PNGs and no settled overflow",
                 "x.documentOverflowPx<=1",
                 "x.cleanup?.includes(\"remaining=0\")"):
        need(term in probe,"real native 200/400 site-zoom gate required: "+term)
    check_native_site_zoom_source((ROOT/"scripts/quality/probe_v3_native_site_zoom.mjs").read_text(encoding="utf-8-sig"))
    # The runner startup can fail transiently before ANY Blazor/browser
    # assertion. Retry only creating the actual browser DevTools connection;
    # never retry or suppress any app/AX/keyboard/visual assertion.
    for term in ("for(let attempt=1;attempt<=3;attempt++)",
                 "browserStartupAttempts.push",
                 'result:"failed"',
                 'if(!target)throw Error',
                 "if(errors.length)process.exitCode=1",
                 "candidate.kill()",
                 "browserStartupAttempts,imageEvidence,checks,errors",
                 "candidate.exitCode!==null&&candidate.exitCode!==0",
                 "cleanupOwnedBrowserProcesses(userData)",
                 "cleanupOwnedBrowserProcesses(work)",
                 "BLUENT_V3_425_OWNED_PROFILE",
                 "if(cleanupError)errors.push"):
        need(term in probe,"browser startup retry must fail closed and retain diagnostics: "+term)
    for forbidden in ("continue-on-error: true","dotnet nuget push","gh release create"):
        need(forbidden not in workflow,"browser gate must fail-closed and must never publish: "+forbidden)

def check_native_site_zoom_source(probe:str)->None:
    for term in ("per_host_zoom_levels", "Math.log(factor)/Math.log(1.2)",
                 "for(const factor of [2,4])", "metricExpr",
                 "state.devicePixelRatio-factor", 'state.rootFont==="16px"',
                 "state.documentScrollWidth-state.viewportWidth", "Page.captureScreenshot",
                 "record.initialMetrics=state", "record.metrics=state", "const renderMode=url.endsWith",
                 '"-"+renderMode+".png"', '"-"+renderMode+".json"',
                 "documentOverflowPx", "remaining=", "cleanupOwned(folder)",
                 'process.exitCode=2', "record.errors.push",
                 "Input.dispatchMouseEvent", "Input.dispatchKeyEvent",
                 "document.elementFromPoint", "document.activeElement?.id==='compatibility-input'",
                 "matches(':focus-visible')", "actualButton:document.activeElement===b",
                 "real native field label is pointer-hittable at site zoom",
                 "real zoom label mouse click focuses the exact native TextField",
                 "Tab from zoomed form focuses actual Bluent Button with focus-visible",
                 "keyboard-focused Button is scrolled fully into native zoom viewport",
                 "real Enter at native site zoom invokes exactly one Blazor callback",
                 "await wait(140)", "settled===actual"):
        need(term in probe,"real browser persisted site zoom evidence missing: "+term)
    for forbidden in ("Emulation.setDeviceMetricsOverride","Emulation.setPageScaleFactor",
                      "document.documentElement.style.fontSize","--force-device-scale-factor",
                      "chrome.tabs.setZoom"):
        need(forbidden not in probe,"native site-zoom probe must not use emulation, CSS scaling or privileged extension: "+forbidden)

def check_compatibility_probe_text(probe_source:str)->None:
    for required in ("line-height: 1.3", "overflow-wrap: anywhere",
                     "color: var(--colorNeutralForeground2Link)"):
        need(required in probe_source,
             "mobile RTL sample must protect heading/link readability: "+required)

def check_compatibility_host_theme(layout_source:str)->None:
    # The host must paint a themed surface behind themed text; otherwise
    # dark-theme screenshots can show white-on-white invisible headings.
    for prop in ("background-color: var(--colorNeutralBackground1)",
                 "color: var(--colorNeutralForeground1)",
                 "min-height: 100vh", "padding: min(2rem, 4vw)"):
        need(prop in layout_source,
             "sample host contrast surface must follow Fluent theme: "+prop)

def check_server_patch(project_xml:str)->None:
    root=ET.fromstring(project_xml)
    reference=[p for p in root.findall(".//PackageReference")
               if p.get("Include")=="Microsoft.AspNetCore.Components.WebAssembly.Server"]
    need(len(reference)==1,"SSR vulnerable package reference missing/ambiguous")
    version=reference[0].get("Version","")
    need(re.fullmatch(r"[0-9]+\.[0-9]+\.[0-9]+",version) is not None,
         "SSR package patch must use an explicit stable version")
    major,minor,patch=map(int,version.split("."))
    need((major,minor)==(10,0) and patch>=13,
         "SSR WebAssembly.Server must be at least patched 10.0.13 (two Oct 2026 advisories)")

def main()->None:
    check(QUALITY.read_text(encoding="utf-8-sig"),
          DOCUMENT.read_text(encoding="utf-8-sig"))
    check_server_patch(SSR_PROJ.read_text(encoding="utf-8-sig"))
    check_compatibility_host_theme(COMPAT_LAYOUT.read_text(encoding="utf-8-sig"))
    check_compatibility_probe_text(COMPAT_PROBE.read_text(encoding="utf-8-sig"))
    check_browser_contract(BROWSERS.read_text(encoding="utf-8-sig"),BROWSER_PROBE.read_text(encoding="utf-8-sig"))
    print("PASS: all-v3-PR source/build/pack/SSR + browser Chrome/Edge x Server/WASM + patched SSR server")

if __name__=="__main__":
    main()
