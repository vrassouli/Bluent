#!/usr/bin/env python3
"""Browser-backed CSS cascade research check for Bluent v3 #417.

This tests native CSS layering/inheritance semantics in a standalone temporary
document, NOT the full Bluent application or a proposed v3 CSS implementation.
Run: python scripts/quality/probe_v3_css_cascade.py
Chrome/Chromium must be installed; optionally pass --chrome "path".
The standalone HTML and Chrome profile are deleted on completion.
"""
from __future__ import annotations
import argparse
import json
import os
from pathlib import Path
import re
import shutil
import subprocess
import sys
import tempfile

HTML = r"""<!doctype html><html lang="en"><meta charset="utf-8"><title>Issue 417 CSS cascade contract</title>
<style>
:root { --colorNeutralForeground1: #242424; }
@layer early, late;
@layer early {
  #normal { color: rgb(255, 0, 0); }
  #important { color: rgb(255, 0, 0) !important; }
  #order { color: rgb(0, 0, 255) !important; }
}
@layer late { #order { color: rgb(0, 128, 0) !important; } }
#normal { color: rgb(0, 128, 0); }
#important { color: rgb(0, 128, 0) !important; }
#order { color: rgb(255, 0, 0) !important; }
[data-bui-theme="dark"] { --colorNeutralForeground1: #ffffff; }
.scope-test { color: var(--colorNeutralForeground1); }
</style>
<div id="normal">normal declaration</div>
<div id="important">important declaration</div>
<div id="order">early important order</div>
<div data-bui-theme="dark"><div class="scope-test" id="nested">nested theme</div></div>
<div class="scope-test" id="portal">out-of-tree portal stand-in</div>
<output id="test-results">PENDING</output>
<script>
const ids = ["normal", "important", "order", "nested", "portal"];
const result = Object.fromEntries(ids.map(id => [id, getComputedStyle(document.getElementById(id)).color]));
document.getElementById("test-results").textContent = JSON.stringify(result);
</script></html>"""
EXPECTED = {
    "normal": "rgb(0, 128, 0)",      # ordinary unlayered CSS overrides layered CSS
    "important": "rgb(255, 0, 0)",  # layered !important beats unlayered !important
    "order": "rgb(0, 0, 255)",     # earlier layer wins for !important
    "nested": "rgb(255, 255, 255)",
    "portal": "rgb(36, 36, 36)",   # independently mounted DOM does not inherit nested theme
}


def find_browser(explicit: str | None) -> str | None:
    if explicit:
        return explicit
    candidates = [
        os.environ.get("CHROME_PATH"),
        shutil.which("chrome"),
        shutil.which("google-chrome"),
        shutil.which("chromium"),
        shutil.which("msedge"),
        r"C:\Program Files\Google\Chrome\Application\chrome.exe",
        r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
    ]
    return next((str(p) for p in candidates if p and Path(p).exists()), None)


def main() -> int:
    args = argparse.ArgumentParser(description=__doc__)
    args.add_argument("--chrome", help="Path to a Chromium-based browser")
    args = args.parse_args()
    chrome = find_browser(args.chrome)
    if not chrome:
        print("ERROR: no Chrome/Chromium installed. Pass --chrome to specify its path.", file=sys.stderr)
        return 2
    with tempfile.TemporaryDirectory(prefix="bluent-v3-cascade-") as base:
        directory = Path(base)
        file = directory / "cascade.html"
        file.write_text(HTML, encoding="utf-8")
        command = [
            chrome, "--headless=new", "--disable-gpu", "--no-sandbox",
            "--disable-extensions", "--no-first-run", "--no-default-browser-check",
            "--dump-dom", file.as_uri(),
        ]
        completed = subprocess.run(command, capture_output=True, text=True,
                                   encoding="utf-8", errors="replace", timeout=45)
        matches = re.search(r'<output id="test-results">([^<]+)</output>', completed.stdout)
        if completed.returncode != 0 or not matches:
            print("ERROR: headless browser did not return completed DOM;",
                  f"exit={completed.returncode}; stdout={completed.stdout[-500:]!r}",
                  f"stderr={completed.stderr[-500:]!r}", file=sys.stderr)
            return 1
        observed = json.loads(matches.group(1))
        failed = {k: {"expected":v, "actual": observed.get(k)}
                  for k, v in EXPECTED.items() if observed.get(k) != v}
        print(json.dumps({"classification": "native browser cascade/inheritance ONLY; not Bluent runtime",
                          "browser": Path(chrome).name,
                          "checks": {key: {"expected": value, "observed": observed.get(key)}
                                     for key, value in EXPECTED.items()},
                          "passed": len(EXPECTED) - len(failed),
                          "total": len(EXPECTED), "failures": failed}, indent=2))
        return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main())
