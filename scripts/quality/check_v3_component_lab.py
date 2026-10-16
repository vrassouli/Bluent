#!/usr/bin/env python3
"""Source-backed pilot coverage contract. Does not claim complete component validation."""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
LAB = ROOT / "src/Bluent.UI.Demo.Pages/Pages/Components/ComponentLab.razor"
STYLE = LAB.with_suffix(".razor.css")
MENU = ROOT / "src/Bluent.UI.Demo.Pages/Layout/Side.razor"
LEDGER = ROOT / "docs/v3/quality/COMPONENT-LAB-COVERAGE.json"


def check() -> int:
    data = json.loads(LEDGER.read_text(encoding="utf-8"))
    source = LAB.read_text(encoding="utf-8-sig")
    css = STYLE.read_text(encoding="utf-8-sig")
    menu = MENU.read_text(encoding="utf-8-sig")
    assert data["schemaVersion"] == 1 and data["issue"] == 421
    assert data["status"] == "pilot_incomplete", "do not infer full coverage from a partial demo"
    assert data["designSource"]["fileId"] == "b64f6665-c9ab-80b5-8008-c4ac99d9d000"
    assert data["designSource"]["approval"] == "pending"
    assert len(data["families"]) == 4
    assert len({entry["id"] for entry in data["families"]}) == 4
    assert '@page "/component-lab"' in source
    assert 'Href="component-lab"' in menu
    assert '@bind:event="oninput"' in source
    for feature in ('id="lab-direction"', 'id="lab-viewport"', 'id="lab-density"',
                    'id="lab-contrast"', 'dir="@_direction"', 'CopySourceAsync',
                    'role="status"', 'aria-pressed=', 'navigator.clipboard.writeText'):
        assert feature in source, f"pilot control missing: {feature}"
    assert 'global theme' in source, "canvas preview MUST not impersonate real app theme"
    assert "max-width:320px" in css and "prefers-reduced-motion:reduce" in css
    for entry in data["families"]:
        assert entry["classification"] == "representative_only"
        if entry["id"] in ("button", "icon"):
            assert entry["renderModesVerified"] == ["Chrome/WebAssembly Dev01: representative lab smoke 9/9 (2026-10-16)"]
        else:
            assert not entry["renderModesVerified"], "do not claim unexercised Label/Link runtime"

        assert entry["source"] == str(LAB.relative_to(ROOT)).replace("\\", "/")
        assert entry["labRoute"] == "/component-lab"
        demo_path = ROOT / "src/Bluent.UI.Demo.Pages/Pages/Components" / (entry["family"] + "s.razor")
        assert demo_path.exists(), f"missing referenced demo: {demo_path}"
        assert f'@page "{entry["existingDemoRoute"]}"' in demo_path.read_text(encoding="utf-8-sig")
        assert f'new("{entry["id"]}", "{entry["family"]}"' in source
        assert entry["scenarioId"] and entry["propertiesDemonstrated"] and entry["remaining"]
    print("Component Lab PILOT contract PASS: 4/4 source-linked families; NOT exhaustive acceptance")
    return 0


if __name__ == "__main__":
    raise SystemExit(check())
