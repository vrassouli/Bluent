#!/usr/bin/env python3
"""#418: Browser media emulation for the *research-only* accessibility token overlay.

This fixture uses ordinary HTML buttons to inspect CSS behavior. It is not a
Blazor Dialog, keyboard interaction test, Windows accessibility conformance
check, or production bundle verification. Fail explicitly when forced-colors
simulation is not available rather than reporting a false pass.
"""
from __future__ import annotations

import html
import json
from pathlib import Path
import re
import subprocess
import sys
import tempfile

from generate_v3_token_preview import CSS_OUT, THEME_DIR
from probe_v3_css_cascade import find_browser

ROOT = Path(__file__).resolve().parents[2]
A11Y_CSS = ROOT / "docs/v3/tokens/issue-418-accessibility.preview.css"
RESULT = re.compile(r'<output id="result">([^<]+)</output>')


def render_fixture(directory: Path, mode: str) -> Path:
    original = (THEME_DIR / f"theme-default-{mode}.css").read_text(encoding="utf-8")
    aliases = CSS_OUT.read_text(encoding="utf-8")
    a11y = A11Y_CSS.read_text(encoding="utf-8")
    page = f"""<!doctype html><html><head><meta charset="utf-8">
<style>{original}</style><style>{aliases}</style><style>{a11y}</style>
<style>
.sample {{background:var(--bui-v3-button-background-primary);
 color:var(--bui-v3-button-foreground-primary);
 border:2px solid var(--bui-v3-border-strong);
 transition:background-color var(--bui-v3-motion-duration-fast) ease;}}
.sample:focus-visible {{outline:2px solid var(--bui-v3-border-focus);}}
.disabled {{color:var(--bui-v3-text-disabled);background:var(--bui-v3-surface-disabled);}}
</style></head>
<body data-bui-theme="{mode}" data-bui-v3-tokens>
<button class="sample" id="button">Button</button>
<span class="disabled" id="disabled">Disabled</span>
<output id="result">PENDING</output>
<script>
const b=document.getElementById("button");
b.focus();
const root=getComputedStyle(document.body);
const bs=getComputedStyle(b);
const disabled=getComputedStyle(document.getElementById("disabled"));
document.getElementById("result").textContent=JSON.stringify({{
  forced:matchMedia("(forced-colors: active)").matches,
  reduced:matchMedia("(prefers-reduced-motion: reduce)").matches,
  duration:bs.transitionDuration,
  bg:bs.backgroundColor,fg:bs.color,
  focus:bs.outlineColor,focusWidth:bs.outlineWidth,focusVisible:b.matches(":focus-visible"),
  action:root.getPropertyValue("--bui-v3-action-background").trim(),
  buttonFg:root.getPropertyValue("--bui-v3-action-on-brand").trim(),
  focusToken:root.getPropertyValue("--bui-v3-border-focus").trim(),
  disabledText:disabled.color,
  disabledToken:root.getPropertyValue("--bui-v3-text-disabled").trim()
}});
</script></body></html>"""
    file = directory / f"default-{mode}.html"
    file.write_text(page, encoding="utf-8")
    return file


def run(chrome: str, page: Path, *flags: str) -> dict:
    cmd = [chrome, "--headless=new", "--disable-gpu", "--disable-extensions",
           "--no-sandbox", "--no-first-run", "--no-default-browser-check",
           *flags, "--dump-dom", page.as_uri()]
    proc = subprocess.run(cmd, capture_output=True, text=True, encoding="utf-8",
                          errors="replace", timeout=40)
    match = RESULT.search(proc.stdout)
    if proc.returncode or not match:
        raise RuntimeError(f"Chrome exit {proc.returncode}; output {len(proc.stdout)}; "
                           f"error: {proc.stderr[-400:]}")
    return json.loads(html.unescape(match.group(1)))


def main() -> int:
    chrome = find_browser(None)
    if not chrome:
        print("SKIP: Chrome unavailable", file=sys.stderr)
        return 2
    rows = []
    failed = []
    with tempfile.TemporaryDirectory(prefix="bluent-v3-a11y-") as temporary:
        directory = Path(temporary)
        for mode in ("light", "dark"):
            page = render_fixture(directory, mode)
            for scenario, flags in (
                ("host-preference", ()),
                ("forced-colors", ("--force-high-contrast",)),
                ("reduced-motion", ("--force-prefers-reduced-motion=reduce",)),
            ):
                try:
                    result = run(chrome, page, *flags)
                except (RuntimeError, subprocess.TimeoutExpired) as exc:
                    failed.append(f"{mode}/{scenario}: {exc}")
                    continue
                rows.append({"mode": mode, "scenario": scenario, **result})
                if scenario == "host-preference":
                    if result["forced"]:
                        failed.append(f"{mode}: native forced-colors already active; baseline unavailable")
                    
                    if result["duration"] != ("0s" if result["reduced"] else "0.15s"):
                        failed.append(f"{mode}: unexpected duration {result['duration']}")
                if scenario == "forced-colors":
                    if not result["forced"]:
                        failed.append(f"{mode}: --force-high-contrast did NOT activate forced-colors")
                    else:
                        for role, expected in (("action", "ButtonFace"),
                                               ("buttonFg", "ButtonText"),
                                               ("focusToken", "Highlight"),
                                               ("disabledToken", "GrayText")):
                            if result[role].lower() != expected.lower():
                                failed.append(f"{mode}: {role}={result[role]} expected {expected}")
                if scenario == "reduced-motion":
                    if not result["reduced"]:
                        failed.append(f"{mode}: --force-prefers-reduced-motion did NOT activate reduce")
                    elif result["duration"] != "0s":
                        failed.append(f"{mode}: reduced motion duration {result['duration']} != 0s")
    print(json.dumps({
        "scope": "HTML/CSS media emulation only; not Blazor, native OS UI, or AT",
        "checks": len(rows), "results": rows, "failures": failed,
        "nonReducedBranchCovered": any(not x["reduced"] for x in rows),
        "legacyBundleChanged": False,
    }, indent=2))
    return 1 if failed else 0


if __name__ == "__main__":
    raise SystemExit(main())
