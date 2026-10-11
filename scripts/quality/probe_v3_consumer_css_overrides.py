#!/usr/bin/env python3
"""Real Bluent compiled CSS + consumer override browser probe for v3 #417.

Uses the existing bundled themes/components, not a synthetic stand-in.
Tests current override compatibility and explains why opt-in @layer needs review.
No runtime Blazor events, remote deployment, or final ADR approval is implied.
"""
from __future__ import annotations
import json
from pathlib import Path
import re
import subprocess
import sys
import tempfile
import html

from probe_v3_css_cascade import find_browser

ROOT = Path(__file__).resolve().parents[2]
ASSETS = ROOT / "src/Bluent.UI/wwwroot"


def main() -> int:
    chrome = find_browser(None)
    if not chrome:
        print("Missing Chrome/Chromium for browser-backed CSS test", file=sys.stderr)
        return 2
    theme = (ASSETS / "bluent.ui.theme.default.min.css").read_text(encoding="utf-8")
    components = (ASSETS / "bluent.ui.components.min.css").read_text(encoding="utf-8")
    assert ".bui-button{" in components and "[data-bui-theme=light]" in theme
    ids = ["baseline", "consumer_override", "token_override", "layer_normal", "layer_important", "nested_dark"]
    rules = """
.case-consumer .bui-button { border-radius: 13px; }
.case-token { --borderRadiusMedium: 14px; }
@layer bluent-v3-proposal {
    .case-layer .bui-button { border-radius: 19px; }
    .case-important .bui-button { border-radius: 7px !important; }
}
.case-important .bui-button { border-radius: 13px !important; }
"""
    containers = [
        '<div class="case-baseline"><button class="bui-button" id="baseline">Existing</button></div>',
        '<div class="case-consumer"><button class="bui-button" id="consumer_override">Consumer</button></div>',
        '<div class="case-token"><button class="bui-button" id="token_override">Token</button></div>',
        '<div class="case-layer"><button class="bui-button" id="layer_normal">Layer normal</button></div>',
        '<div class="case-important"><button class="bui-button" id="layer_important">Layer important</button></div>',
        '<div class="case-nested" data-bui-theme="dark"><button class="bui-button" id="nested_dark">Nested dark</button></div>',
    ]
    document = f"""<!doctype html><html lang="en" data-bui-theme="light"><meta charset="utf-8">
<title>Actual Bluent compiled CSS override compatibility</title>
<style>{theme}</style><style>{components}</style><style>{rules}</style>
<body>{''.join(containers)}
<output id="consumer-results">PENDING</output>
<script>
const ids={json.dumps(ids)};
const result=Object.fromEntries(ids.map(id=>{{
 const s=getComputedStyle(document.getElementById(id));
 return [id,{{radius:s.borderTopLeftRadius,background:s.backgroundColor}}];
}}));
document.getElementById("consumer-results").textContent=JSON.stringify(result);
</script></body></html>"""
    expected_radii = {
        "baseline": "4px",
        "consumer_override": "13px",
        "token_override": "14px",
        "layer_normal": "4px",
        "layer_important": "7px",
        "nested_dark": "4px",
    }
    with tempfile.TemporaryDirectory(prefix="bluent-v3-consumer-css-") as directory:
        p = Path(directory) / "source-consumer-overrides.html"
        p.write_text(document, encoding="utf-8")
        command = [chrome, "--headless=new", "--disable-gpu", "--disable-extensions",
                   "--no-first-run", "--no-default-browser-check", "--no-sandbox",
                   "--dump-dom", p.as_uri()]
        result = subprocess.run(command, capture_output=True, text=True,
                                encoding="utf-8", errors="replace", timeout=45)
        m = re.search(r'<output id="consumer-results">([^<]+)</output>', result.stdout)
        if result.returncode != 0 or not m:
            print("Real compiled CSS browser probe failed; "
                  f"exit={result.returncode}, stderr={result.stderr[-500:]!r}", file=sys.stderr)
            return 1
        observed = json.loads(html.unescape(m.group(1)))
    failures = {}
    for name, radius in expected_radii.items():
        if observed.get(name, {}).get("radius") != radius:
            failures[name] = {"expectedRadius": radius, "observed": observed.get(name)}
    if observed.get("nested_dark", {}).get("background") != "rgb(41, 41, 41)":
        failures["nested_dark_background"] = {
            "expected": "rgb(41, 41, 41)",
            "observed": observed.get("nested_dark"),
        }
    print(json.dumps({
        "classification": "Actual compiled Bluent theme + component CSS; headless browser computed style",
        "themeBytes": len(theme.encode("utf-8")),
        "componentsBytes": len(components.encode("utf-8")),
        "expected": expected_radii,
        "observed": observed,
        "passed": 7 - len(failures), "total": 7, "failures": failures,
        "scope": "Representative Button CSS overrides; not full external consumer apps or Blazor events",
    }, indent=2))
    return int(bool(failures))


if __name__ == "__main__":
    sys.exit(main())
