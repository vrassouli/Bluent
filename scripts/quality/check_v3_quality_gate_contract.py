"""Issue #425: every-PR v3 quality gate with non-interchangeable evidence."""
from __future__ import annotations
import re
import xml.etree.ElementTree as ET
from pathlib import Path

ROOT=Path(__file__).resolve().parents[2]
QUALITY=ROOT/".github/workflows/v3-quality-gates.yml"
DOCUMENT=ROOT/"docs/v3/quality/EVIDENCE-AND-GATES.md"
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
    print("PASS: every-v3-PR build/test/pack + rendered SSR + patched server security dependency")

if __name__=="__main__":
    main()
