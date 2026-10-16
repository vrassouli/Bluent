# Component Lab (#421) contributor guide

Follow GitHub Project #5 Backlog to Ready to In progress lifecycle.
Only develop on task branches targeting bluent-v3; never stable Dev.

Design: actual editable Bluent v3 Penpot file
b64f6665-c9ab-80b5-8008-c4ac99d9d000 and page
e775e67c-d9da-804b-8008-cc7c2dd7ecf7, native desktop and mobile
boards documented in docs/v3/quality/COMPONENT-LAB-PILOT.md.

Razor route /component-lab in Demo.Pages/Pages/Components/ComponentLab.
Coverage: docs/v3/quality/COMPONENT-LAB-COVERAGE.json.
Representative-only means NOT complete v3 component acceptance.

Quality: run python scripts/quality/check_v3_component_lab.py;
then pwsh -NoProfile -File scripts/quality/run_v3_component_lab.ps1.
Real Chrome/Blazor WASM pilot 9/9 and scoped Windows browser cleanup
remaining=0 are observed. It does not certify Server/Edge/native AT.

Do not turn sample contrast into a global theme claim.
Do not invent new Bluent public API for demos.
Known existing 10.0.7 Microsoft.AspNetCore.Components.WebAssembly.Server
security advisories NU1903 must not be suppressed or called clean.

2026-10-16: Generate the 66-family complete work queue (NOT
demo acceptance) with python scripts/quality/generate_v3_component_lab_queue.py
--write; run python scripts/quality/check_v3_component_lab.py
for fail-closed source and issue mapping to canonical #494 and #428-#493.
The generated JSON is docs/v3/quality/COMPONENT-LAB-FAMILY-QUEUE.json.
A candidate component source or existing markup demo alone does not
prove comprehensive public API, design parity, native accessibility
or browser coverage. Initial Lab has four pilot families, with only
Button/Icon real Chrome/WebAssembly interaction evidence.
