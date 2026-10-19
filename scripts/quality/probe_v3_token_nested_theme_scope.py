#!/usr/bin/env python3
"""#418: opt-in v3 token boundary, nested Theme and legacy variable regression.

Runs actual emitted Bluent Light/Dark brand CSS (all ten brands) plus the
generated *opt-in* preview bridge in headless Chrome. Does not exercise a
service-rendered Blazor Dialog, and does not assert AT/WCAG compliance.
"""
from __future__ import annotations

from concurrent.futures import ThreadPoolExecutor, as_completed
import html
import json
from pathlib import Path
import re
import subprocess
import sys
import tempfile

from generate_v3_token_preview import MATRIX_OUT, CSS_OUT, THEME_DIR
from probe_v3_css_cascade import find_browser

OUT = re.compile(r'<output id="scope-result">([^<]+)</output>')


def rgb(value: str) -> str:
    value = value.lstrip("#")
    return "rgb(" + ", ".join(str(int(value[i:i + 2], 16)) for i in (0, 2, 4)) + ")"


def check_brand(chrome: str, directory: Path, brand: str, modes: dict, alias_css: str) -> dict:
    light = (THEME_DIR / f"theme-{brand}-light.css").read_text(encoding="utf-8")
    dark = (THEME_DIR / f"theme-{brand}-dark.css").read_text(encoding="utf-8")
    document = f"""<!doctype html><html lang="en"><meta charset="utf-8">
<style>{light}</style><style>{dark}</style><style>{alias_css}</style>
<style>
  .probe {{display:block; background:var(--bui-v3-button-background-primary, #ff00ff);
            color:var(--bui-v3-button-foreground-primary, #ff00ff);}}
  .legacy {{display:block; background:var(--colorBrandBackground);}}
</style>
<body data-bui-theme="light">
  <div id="outside"><span class="probe" id="outside-probe">No opt-in</span></div>
  <div id="own-light" data-bui-v3-tokens data-bui-theme="light">
    <span class="probe" id="own-light-probe">Opt-in light</span>
    <span class="legacy" id="own-light-legacy">Legacy variable</span>
    <div id="nested-dark" data-bui-theme="dark">
      <span class="probe" id="nested-dark-probe">Nested dark</span>
      <span class="legacy" id="nested-dark-legacy">Legacy dark</span>
      <div id="nested-relight" data-bui-theme="light">
        <span class="probe" id="nested-relight-probe">Nested light</span>
      </div>
    </div>
  </div>
  <div id="outside-dark" data-bui-theme="dark">
    <span class="probe" id="outside-dark-probe">Outside opt-in dark</span>
  </div>
  <output id="scope-result">PENDING</output>
<script>
  const keys=["outside","own-light","nested-dark","nested-relight","outside-dark"];
  let result={{}};
  for (const key of keys) {{
    const node=document.getElementById(key+"-probe");
    const styles=getComputedStyle(node);
    result[key]={{bg:styles.backgroundColor,fg:styles.color,
       alias:styles.getPropertyValue("--bui-v3-button-background-primary").trim()}};
  }}
  result["legacy-light"]=getComputedStyle(document.getElementById("own-light-legacy")).backgroundColor;
  result["legacy-dark"]=getComputedStyle(document.getElementById("nested-dark-legacy")).backgroundColor;
  document.getElementById("scope-result").textContent=JSON.stringify(result);
</script></body></html>"""
    page = directory / f"scope-{brand}.html"
    page.write_text(document, encoding="utf-8")
    command = [chrome, "--headless=new", "--disable-gpu", "--no-sandbox",
               "--disable-extensions", "--no-first-run", "--no-default-browser-check",
               "--dump-dom", page.as_uri()]
    result = subprocess.run(command, capture_output=True, text=True,
                            encoding="utf-8", errors="replace", timeout=45)
    match = OUT.search(result.stdout)
    if result.returncode != 0 or not match:
        raise RuntimeError(f"{brand}: Chromium exit={result.returncode}: {result.stderr[-600:]}")
    actual = json.loads(html.unescape(match.group(1)))
    light_c = rgb(modes["light"]["tokens"]["bluent.component.button.backgroundPrimary"])
    dark_c = rgb(modes["dark"]["tokens"]["bluent.component.button.backgroundPrimary"])
    light_fg = rgb(modes["light"]["tokens"]["bluent.component.button.foregroundPrimary"])
    dark_fg = rgb(modes["dark"]["tokens"]["bluent.component.button.foregroundPrimary"])
    expected = {
        "outside.bg": "rgb(255, 0, 255)",
        "outside-dark.bg": "rgb(255, 0, 255)",
        "own-light.bg": light_c,
        "own-light.fg": light_fg,
        "nested-dark.bg": dark_c,
        "nested-dark.fg": dark_fg,
        "nested-relight.bg": light_c,
        "nested-relight.fg": light_fg,
        "legacy-light": light_c,
        "legacy-dark": dark_c,
    }
    observed = {}
    for name in expected:
        parts = name.split(".")
        value = actual[parts[0]] if len(parts) == 1 else actual[parts[0]][parts[1]]
        observed[name] = value
    failures = {key: {"expected":val, "actual":observed[key]}
                for key, val in expected.items() if observed[key] != val}
    return {"brand": brand, "checks": len(expected),
            "passed": len(expected) - len(failures), "failures": failures,
            "lightBg": observed["own-light.bg"],
            "darkBg": observed["nested-dark.bg"]}


def main() -> int:
    chrome = find_browser(None)
    if not chrome:
        print("Chrome/Chromium is missing", file=sys.stderr)
        return 2
    data = json.loads(MATRIX_OUT.read_text(encoding="utf-8"))
    css = CSS_OUT.read_text(encoding="utf-8")
    with tempfile.TemporaryDirectory(prefix="bluent-v3-418-theme-scope-") as directory:
        tasks = []
        with ThreadPoolExecutor(max_workers=4) as executor:
            for brand, modes in data["brands"].items():
                tasks.append(executor.submit(check_brand, chrome, Path(directory), brand, modes, css))
            results = []
            for future in as_completed(tasks):
                try:
                    results.append(future.result())
                except (OSError, RuntimeError, subprocess.TimeoutExpired) as exc:
                    print("Nested theme browser probe failed: " + str(exc), file=sys.stderr)
                    return 1
    results.sort(key=lambda item: item["brand"])
    failures = [item for item in results if item["failures"]]
    print(json.dumps({
        "scope": "real emitted 10-brand Light/Dark CSS + opt-in token preview, native headless Chrome",
        "brands": len(results),
        "assertions": sum(item["checks"] for item in results),
        "passed": sum(item["passed"] for item in results),
        "failures": failures,
        "example": next((item for item in results if item["brand"] == "default"), None),
        "limits": "DOM ancestry only; not actual service-hosted Dialog portals, interactive Blazor, forced colors or AT",
    }, indent=2))
    return int(bool(failures))


if __name__ == "__main__":
    raise SystemExit(main())
