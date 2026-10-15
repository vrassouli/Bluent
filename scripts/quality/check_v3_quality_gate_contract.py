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
    # The runner startup can fail transiently before ANY Blazor/browser
    # assertion. Retry only creating the actual browser DevTools connection;
    # never retry or suppress any app/AX/keyboard/visual assertion.
    for term in ("for(let attempt=1;attempt<=3;attempt++)",
                 "browserStartupAttempts.push",
                 'result:"failed"',
                 'if(!target)throw Error',
                 "if(errors.length)process.exitCode=1",
                 "candidate.kill()",
                 "browserStartupAttempts,checks,errors",
                 "candidate.exitCode!==null&&candidate.exitCode!==0",
                 "cleanupOwnedBrowserProcesses(userData)",
                 "cleanupOwnedBrowserProcesses(work)",
                 "BLUENT_V3_425_OWNED_PROFILE",
                 "if(cleanupError)errors.push"):
        need(term in probe,"browser startup retry must fail closed and retain diagnostics: "+term)
    for forbidden in ("continue-on-error: true","dotnet nuget push","gh release create"):
        need(forbidden not in workflow,"browser gate must fail-closed and must never publish: "+forbidden)

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
    check_browser_contract(BROWSERS.read_text(encoding="utf-8-sig"),BROWSER_PROBE.read_text(encoding="utf-8-sig"))
    print("PASS: all-v3-PR source/build/pack/SSR + browser Chrome/Edge x Server/WASM + patched SSR server")

if __name__=="__main__":
    main()
