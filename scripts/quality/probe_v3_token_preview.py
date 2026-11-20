#!/usr/bin/env python3
"""#418: browser-computed, real 10-brand x Light/Dark v3 opt-in alias smoke."""
from __future__ import annotations

from concurrent.futures import ThreadPoolExecutor, as_completed
import html
import json
from pathlib import Path
import re
import subprocess
import sys
import tempfile

from generate_v3_token_preview import ROOT, THEME_DIR, MATRIX_OUT, CSS_OUT
from probe_v3_css_cascade import find_browser

OUTPUT_RE = re.compile(r'<output id="token-result">([^<]+)</output>')


def check_one(chrome: str, directory: Path, brand: str, mode: str, data: dict, preview: str) -> dict:
    theme_file = THEME_DIR / f"theme-{brand}-{mode}.css"
    original = theme_file.read_text(encoding="utf-8")
    tokens = data["tokens"]
    css_style = """
.sample { color:var(--bui-v3-button-foreground-primary); background:var(--bui-v3-button-background-primary);
border:1px solid var(--bui-v3-border-strong) }
.disabled { color:var(--bui-v3-text-disabled);background:var(--bui-v3-surface-disabled) }
.danger-candidate { color:var(--bui-v3-badge-danger-text-accessible);background:var(--bui-v3-surface-default) }
.focus-candidate { outline:2px solid var(--bui-v3-button-focus-outer-candidate);outline-offset:1px }
"""
    text = f"""<!doctype html><html><meta charset="utf-8">
<style>{original}</style><style>{preview}</style><style>{css_style}</style>
<body data-bui-theme="{mode}" data-bui-brand="{brand}" data-bui-v3-tokens>
<button class="sample" id="sample">Source-aligned Brand</button>
<span id="candidate-action" style="color:var(--bui-v3-action-foreground)">Action candidate</span>
<span id="candidate-link-rest" style="color:var(--bui-v3-link-foreground)">Link Rest candidate</span>
<span id="candidate-link-hover" style="color:var(--bui-v3-link-foreground-hover)">Link Hover candidate</span>
<span id="candidate-link-pressed" style="color:var(--bui-v3-link-foreground-pressed)">Link Pressed candidate</span>
<div id="disabled" class="disabled">Disabled</div>
<div id="danger-candidate" class="danger-candidate">Danger text candidate</div>
<button id="focus-candidate" class="focus-candidate">Focus candidate</button>
<output id="token-result">PENDING</output>
<script>
let s=getComputedStyle(document.getElementById('sample'));
let d=getComputedStyle(document.getElementById('disabled'));
let danger=getComputedStyle(document.getElementById('danger-candidate'));
let focus=getComputedStyle(document.getElementById('focus-candidate'));
let candidateAction=getComputedStyle(document.getElementById('candidate-action')).color;
let candidateLinkRest=getComputedStyle(document.getElementById('candidate-link-rest')).color;
let candidateLinkHover=getComputedStyle(document.getElementById('candidate-link-hover')).color;
let candidateLinkPressed=getComputedStyle(document.getElementById('candidate-link-pressed')).color;
document.getElementById('token-result').textContent=JSON.stringify({{
bg:s.backgroundColor,fg:s.color,border:s.borderTopColor,
disabledFg:d.color,disabledBg:d.backgroundColor,
dangerCandidateFg:danger.color,dangerCandidateBg:danger.backgroundColor,focusCandidateColor:focus.outlineColor,focusCandidateWidth:focus.outlineWidth,focusCandidateOffset:focus.outlineOffset,
candidateAction,candidateLinkRest,candidateLinkHover,candidateLinkPressed
}});
</script></body></html>"""
    file = directory / f"brand-{brand}-{mode}.html"
    file.write_text(text, encoding="utf-8")
    command = [chrome, "--headless=new", "--disable-gpu", "--disable-extensions",
               "--no-sandbox", "--no-first-run", "--no-default-browser-check",
               "--dump-dom", file.as_uri()]
    result = subprocess.run(command, capture_output=True, text=True,
                            encoding="utf-8", errors="replace", timeout=45)
    match = OUTPUT_RE.search(result.stdout)
    if result.returncode or not match:
        raise RuntimeError(f"{brand}/{mode}: browser error {result.returncode}: {result.stderr[-300:]}")
    actual = json.loads(html.unescape(match.group(1)))
    def rgb(value: str) -> str:
        value = value.lstrip("#")
        if len(value) == 3:
            value = "".join(ch*2 for ch in value)
        return f"rgb({int(value[0:2],16)}, {int(value[2:4],16)}, {int(value[4:6],16)})"
    expect = {
        "bg": rgb(tokens["bluent.component.button.backgroundPrimary"]),
        "fg": rgb(tokens["bluent.component.button.foregroundPrimary"]),
        "border": rgb(tokens["bluent.semantic.border.strong"]),
        "disabledFg": rgb(tokens["bluent.semantic.text.disabled"]),
        "disabledBg": rgb(tokens["bluent.semantic.surface.disabled"]),
        "dangerCandidateFg": rgb(tokens["bluent.component.badge.dangerTextAccessible"]),
        "dangerCandidateBg": rgb(tokens["bluent.semantic.surface.default"]),
        "focusCandidateColor":rgb(tokens["bluent.component.button.focusOuterCandidate"]),
        "focusCandidateWidth":"2px",
        "focusCandidateOffset":"1px",
    }
    if mode == "dark":
        candidates = json.loads(MATRIX_OUT.read_text(encoding="utf-8"))["darkBrandForegroundCandidates"][brand]["roles"]
        for role, key in (("action", "candidateAction"), ("linkRest", "candidateLinkRest"),
                          ("linkHover", "candidateLinkHover"), ("linkPressed", "candidateLinkPressed")):
            expect[key] = rgb(candidates[role]["candidate"])
    discrepancies = {k: {"expected":v,"observed":actual.get(k)}
                     for k, v in expect.items() if actual.get(k) != v}
    return {"brand":brand, "mode":mode, "checks":len(expect),
            "passed":len(expect)-len(discrepancies), "errors":discrepancies,
            "darkForegroundCandidates": ({key: actual.get(key) for key in
                ("candidateAction", "candidateLinkRest", "candidateLinkHover", "candidateLinkPressed")}
                if mode == "dark" else None),
            "brandBackground":actual.get("bg")}


def main() -> int:
    chrome = find_browser(None)
    if not chrome:
        print("Cannot locate Chrome/Chromium", file=sys.stderr)
        return 2
    matrix = json.loads(MATRIX_OUT.read_text(encoding="utf-8"))["brands"]
    preview = CSS_OUT.read_text(encoding="utf-8")
    with tempfile.TemporaryDirectory(prefix="bluent-v3-token-418-chrome-") as temp:
        directory = Path(temp)
        jobs = [(brand, mode, data) for brand, modes in matrix.items()
                for mode, data in modes.items()]
        results = []
        with ThreadPoolExecutor(max_workers=4) as pool:
            tasks = {pool.submit(check_one, chrome, directory, brand, mode, data, preview): (brand, mode)
                     for brand, mode, data in jobs}
            for task in as_completed(tasks):
                key = tasks[task]
                try:
                    results.append(task.result())
                except (OSError, RuntimeError, subprocess.TimeoutExpired) as e:
                    print(f"ERROR {key}: {e}", file=sys.stderr)
                    return 1
    results.sort(key=lambda r: (r["brand"], r["mode"]))
    failed = [r for r in results if r["errors"]]
    print(json.dumps({
        "classification":"Actual Chromium computed styles, existing emitted brand/mode CSS + opt-in v3 token preview",
        "modePairs":len(results), "assertions":sum(r["checks"] for r in results),
        "passed":sum(r["passed"] for r in results),
        "failures":failed,
        "example":next((r for r in results if r["brand"]=="default" and r["mode"]=="dark"),None),
        "caveat":"Tokens/palette only; not full keyboard, AT, portal inheritance, forced-colors or all component parity",
    }, indent=2))
    return int(bool(failed))


if __name__ == "__main__":
    raise SystemExit(main())