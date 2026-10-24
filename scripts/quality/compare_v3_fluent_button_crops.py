#!/usr/bin/env python3
"""Reproducible, narrowly scoped RGB diff of real Fluent/Bluent Button PNG crops.

This is diagnostic evidence only. It intentionally does not apply a pass/fail threshold.
"""
import argparse
import hashlib
import json
import struct
import zlib
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
EVIDENCE = ROOT / "docs/v3/quality/evidence"
JSON_OUT = EVIDENCE / "FLUENT-BLUENT-BUTTON-PRIMARY-CROP-DIFF.json"
TYPOGRAPHY_JSON = EVIDENCE / "FLUENT-BLUENT-BUTTON-TYPOGRAPHY-CHROME.json"
SOURCE_BASELINE = "b9952aa93e89fd569de54080a7fdd06037b53a41"
OFFICIAL_PACKAGE = "@fluentui/web-components@3.1.3"
PAIR_NAMES = {
    "LIGHT-LTR": (
        "FLUENT-WC-3.1.3-LIGHT-LTR-PRIMARY-CROP-CHROME.png",
        "BLUENT-LAB-BUTTON-LIGHT-LTR-PRIMARY-CROP-CHROME.png",
        "FLUENT-BLUENT-BUTTON-LIGHT-LTR-PRIMARY-CROP-DIFF-CHROME.png",
    ),
    "DARK-RTL": (
        "FLUENT-WC-3.1.3-DARK-RTL-PRIMARY-CROP-CHROME.png",
        "BLUENT-LAB-BUTTON-DARK-RTL-PRIMARY-CROP-CHROME.png",
        "FLUENT-BLUENT-BUTTON-DARK-RTL-PRIMARY-CROP-DIFF-CHROME.png",
    ),
}
PNG_SIGNATURE = b"\x89PNG\r\n\x1a\n"


def sha256(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def _paeth(a: int, b: int, c: int) -> int:
    p = a + b - c
    pa, pb, pc = abs(p - a), abs(p - b), abs(p - c)
    if pa <= pb and pa <= pc:
        return a
    if pb <= pc:
        return b
    return c


def decode_png_rgb(path: Path):
    data = path.read_bytes()
    if not data.startswith(PNG_SIGNATURE):
        raise ValueError(f"Not a PNG: {path}")
    offset, width, height, depth, color_type = 8, None, None, None, None
    compressed = bytearray()
    while offset < len(data):
        if offset + 12 > len(data):
            raise ValueError(f"Truncated PNG chunk: {path}")
        size = struct.unpack(">I", data[offset:offset + 4])[0]
        kind = data[offset + 4:offset + 8]
        payload = data[offset + 8:offset + 8 + size]
        if len(payload) != size:
            raise ValueError(f"Truncated PNG payload: {path}")
        if kind == b"IHDR":
            width, height, depth, color_type, compression, filt, interlace = struct.unpack(">IIBBBBB", payload)
            if compression != 0 or filt != 0 or interlace != 0 or depth != 8 or color_type not in (2, 6):
                raise ValueError(f"Unsupported PNG encoding in {path}: depth={depth}, color={color_type}, interlace={interlace}")
        elif kind == b"IDAT":
            compressed.extend(payload)
        elif kind == b"IEND":
            break
        offset += 12 + size
    if width is None or height is None:
        raise ValueError(f"Missing IHDR: {path}")
    channels = 3 if color_type == 2 else 4
    bpp, stride = channels, width * channels
    decoded = zlib.decompress(bytes(compressed))
    if len(decoded) != height * (stride + 1):
        raise ValueError(f"Unexpected decoded byte count: {path}")
    rgb = bytearray(width * height * 3)
    prev = bytearray(stride)
    pos = out_pos = 0
    for _y in range(height):
        ftype = decoded[pos]
        pos += 1
        source = decoded[pos:pos + stride]
        pos += stride
        row = bytearray(stride)
        for i, value in enumerate(source):
            left = row[i - bpp] if i >= bpp else 0
            above = prev[i]
            upper_left = prev[i - bpp] if i >= bpp else 0
            if ftype == 0:
                predict = 0
            elif ftype == 1:
                predict = left
            elif ftype == 2:
                predict = above
            elif ftype == 3:
                predict = (left + above) // 2
            elif ftype == 4:
                predict = _paeth(left, above, upper_left)
            else:
                raise ValueError(f"Unknown PNG filter {ftype}: {path}")
            row[i] = (value + predict) & 255
        if color_type == 2:
            rgb[out_pos:out_pos + width * 3] = row
            out_pos += width * 3
        else:
            for i in range(0, stride, 4):
                rgb[out_pos:out_pos + 3] = row[i:i + 3]
                out_pos += 3
        prev = row
    return width, height, bytes(rgb), sha256(data)


def foreground_mask(rgb: bytes, surface_rgb, threshold: int = 50):
    """Return a diagnostic high-contrast-text mask inside a shared 84x20 inset.

    The reference and target are classified relative to their own center-fill RGB,
    so a small background token difference does not by itself count as foreground.
    The threshold is exploratory and is not an acceptance criterion.
    """
    width, height = 96, 32
    mask = set()
    for y in range(6, 26):
        for x in range(6, 90):
            i = (y * width + x) * 3
            if max(abs(rgb[i + c] - surface_rgb[c]) for c in range(3)) >= threshold:
                mask.add((x, y))
    if not mask:
        raise ValueError("Foreground mask is empty; review crop and threshold")
    bbox = {
        "left": min(x for x, _ in mask),
        "top": min(y for _, y in mask),
        "right": max(x for x, _ in mask),
        "bottom": max(y for _, y in mask),
    }
    bbox["width"] = bbox["right"] - bbox["left"] + 1
    bbox["height"] = bbox["bottom"] - bbox["top"] + 1
    return mask, bbox


def _chunk(kind: bytes, payload: bytes) -> bytes:
    return struct.pack(">I", len(payload)) + kind + payload + struct.pack(">I", zlib.crc32(kind + payload) & 0xffffffff)


def encode_png_rgb(width: int, height: int, rgb: bytes) -> bytes:
    if len(rgb) != width * height * 3:
        raise ValueError("Invalid RGB byte count for PNG writer")
    rows = b"".join(b"\x00" + rgb[y * width * 3:(y + 1) * width * 3] for y in range(height))
    header = struct.pack(">IIBBBBB", width, height, 8, 2, 0, 0, 0)
    return PNG_SIGNATURE + _chunk(b"IHDR", header) + _chunk(b"IDAT", zlib.compress(rows, 9)) + _chunk(b"IEND", b"")


def build():
    if not TYPOGRAPHY_JSON.is_file():
        raise ValueError(f"Missing live-browser typography evidence: {TYPOGRAPHY_JSON.name}")
    typography = json.loads(TYPOGRAPHY_JSON.read_text(encoding="utf-8-sig"))
    comparisons, images = [], {}
    for mode, (official_name, bluent_name, diff_name) in PAIR_NAMES.items():
        official_path, bluent_path = EVIDENCE / official_name, EVIDENCE / bluent_name
        ow, oh, official_rgb, official_hash = decode_png_rgb(official_path)
        bw, bh, bluent_rgb, bluent_hash = decode_png_rgb(bluent_path)
        if (ow, oh) != (96, 32) or (bw, bh) != (96, 32):
            raise ValueError(f"{mode}: expected both actual host crops to be exactly 96x32, got Fluent {ow}x{oh}, Bluent {bw}x{bh}")
        style_mode = typography.get("modes", {}).get(mode)
        if not style_mode:
            raise ValueError(f"Missing computed-style evidence for mode {mode}")
        if style_mode["official"].get("sha256") != official_hash or style_mode["bluent"].get("sha256") != bluent_hash:
            raise ValueError(f"{mode}: typography capture hashes do not match the pixel-diff input crops")
        style_comparison = style_mode["comparison"]
        official_style = style_mode["official"]["computedStyle"]
        bluent_style = style_mode["bluent"]["computedStyle"]
        official_text_width = style_mode["official"]["textRectRelativeToHost"]["width"]
        bluent_text_width = style_mode["bluent"]["textRectRelativeToHost"]["width"]
        official_surface = tuple(official_rgb[(16 * 96 + 48) * 3:(16 * 96 + 48) * 3 + 3])
        bluent_surface = tuple(bluent_rgb[(16 * 96 + 48) * 3:(16 * 96 + 48) * 3 + 3])
        official_mask, official_mask_bbox = foreground_mask(official_rgb, official_surface)
        bluent_mask, bluent_mask_bbox = foreground_mask(bluent_rgb, bluent_surface)
        mask_intersection = len(official_mask & bluent_mask)
        mask_union = len(official_mask | bluent_mask)
        changed, sum_delta, per_pixel_max, diff = 0, 0, [], bytearray(len(official_rgb))
        for i in range(0, len(official_rgb), 3):
            delta = [abs(official_rgb[i + c] - bluent_rgb[i + c]) for c in range(3)]
            mx = max(delta)
            changed += mx > 0
            sum_delta += sum(delta)
            per_pixel_max.append(mx)
            for c in range(3):
                diff[i + c] = min(255, delta[c] * 3)
        sorted_max = sorted(per_pixel_max)
        diff_png = encode_png_rgb(96, 32, bytes(diff))
        images[diff_name] = diff_png
        comparisons.append({
            "mode": mode,
            "officialFile": official_name,
            "bluentFile": bluent_name,
            "differenceImage": diff_name,
            "width": 96,
            "height": 32,
            "changedPixels": changed,
            "totalPixels": 96 * 32,
            "changedPixelRatio": changed / (96 * 32),
            "meanAbsoluteChannelDifference": sum_delta / (96 * 32 * 3),
            "p95PerPixelMaxChannelDifference": sorted_max[int(0.95 * (len(sorted_max) - 1))],
            "maxObservedChannelDifference": max(sorted_max),
            "surfaceColor": {
                "samplePoint": {"x": 48, "y": 16},
                "officialRGB": list(official_surface),
                "bluentRGB": list(bluent_surface),
                "absoluteChannelDelta": [abs(official_surface[c] - bluent_surface[c]) for c in range(3)],
            },
            "computedTypographyEvidence": {
                "sourceFile": TYPOGRAPHY_JSON.name,
                "officialFontFamily": official_style["fontFamily"],
                "bluentFontFamily": bluent_style["fontFamily"],
                "fontFamilyDiffers": style_comparison["fontFamilyDiffers"],
                "fontSize": {"official": official_style["fontSize"], "bluent": bluent_style["fontSize"], "matches": style_comparison["fontSizeMatches"]},
                "fontWeight": {"official": official_style["fontWeight"], "bluent": bluent_style["fontWeight"], "matches": style_comparison["fontWeightMatches"]},
                "lineHeight": {"official": official_style["lineHeight"], "bluent": bluent_style["lineHeight"], "matches": style_comparison["lineHeightMatches"]},
                "inlinePaddingMatches": style_comparison["horizontalPaddingMatches"],
                "textRectWidthCssPx": {"official": official_text_width, "bluent": bluent_text_width, "bluentMinusOfficial": style_comparison["textRangeWidthDeltaCssPx"]},
            },
            "foregroundMask": {
                "purpose": "diagnostic high-contrast glyph/content silhouette after factoring out each surface fill color",
                "method": "pixel included when max absolute RGB-channel distance from its own center surface color is at least 50",
                "sampleRegionInclusive": {"left": 6, "top": 6, "right": 89, "bottom": 25},
                "officialPixelCount": len(official_mask),
                "bluentPixelCount": len(bluent_mask),
                "intersectionPixels": mask_intersection,
                "unionPixels": mask_union,
                "intersectionOverUnion": mask_intersection / mask_union,
                "officialBoundingBox": official_mask_bbox,
                "bluentBoundingBox": bluent_mask_bbox,
                "thresholdIsExploratoryNotAcceptance": True,
            },
            "officialSHA256": official_hash,
            "bluentSHA256": bluent_hash,
            "differenceImageSHA256": sha256(diff_png),
        })
    ledger = {
        "schemaVersion": 1,
        "issue": 552,
        "comparison": "Primary Button host-crop pixel diagnostic",
        "captureDate": "2026-10-24",
        "reference": {"package": OFFICIAL_PACKAGE, "themePackage": "@fluentui/tokens@1.0.0-alpha.24", "source": "real published custom elements and real browser rendering"},
        "bluent": {"repo": "vrassouli/Bluent", "sourceBranch": "v3/issue-421-component-lab", "sourceRef": SOURCE_BASELINE, "source": "real source-built Blazor WebAssembly Component Lab"},
        "browser": {"engine": "Chromium/Chrome", "nominalViewport": {"width": 1240, "height": 1140}, "deviceScaleFactor": 1},
        "normalization": {"component": "primary Button", "visibleLabel": "Continue", "cssHostSize": {"width": 96, "height": 32}, "capture": "actual rendered host border-box crop; app scaffolding excluded; focus blurred and pointer moved away on Bluent before capture", "directions": ["Light/LTR", "Dark/RTL"]},
        "algorithm": {"channels": "8-bit true-color RGB; all six input PNGs are color-type 2 and have no alpha channel", "changedPixel": "at least one RGB channel differs by at least 1", "meanAbsoluteChannelDifference": "mean absolute RGB-channel delta over all pixels", "differenceImage": "per-channel absolute difference multiplied by 3 and clamped to 255"},
        "comparisons": comparisons,
        "status": "diagnostic_pixel_difference_not_parity_approval",
        "parityAccepted": False,
        "acceptanceLimitations": ["This does not align Fluent/Bluent token systems, font rendering, internal markup, or the approved Penpot design.", "Changed-pixel ratio counts any nonzero surface-fill channel difference and is not a perceptual quality score or pass threshold.", "Foreground-mask results depend on an exploratory max-channel threshold; they describe only a crop silhouette, not optical/typographic acceptance.", "Only the primary Button in two visual modes is covered; other Button appearances/states and other 17 families are not.", "The crop excludes outside focus/box-shadow pixels and the application scaffolding.", "No native OS high-contrast or assistive-technology acceptance is implied."],
    }
    return ledger, images


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    group = parser.add_mutually_exclusive_group(required=True)
    group.add_argument("--write", action="store_true", help="write reviewed diagnostic JSON and diff PNGs")
    group.add_argument("--check", action="store_true", help="verify JSON and PNGs match the current source crops")
    args = parser.parse_args()
    ledger, images = build()
    expected_json = json.dumps(ledger, indent=2, ensure_ascii=False) + "\n"
    if args.write:
        for name, data in images.items():
            (EVIDENCE / name).write_bytes(data)
        JSON_OUT.write_text(expected_json, encoding="utf-8")
        print(f"Wrote {len(images)} diagnostic diff PNGs and {JSON_OUT.name}; parityAccepted=false")
        return
    if not JSON_OUT.is_file() or JSON_OUT.read_text(encoding="utf-8-sig") != expected_json:
        raise SystemExit("Button crop pixel-diff JSON is stale; run with --write after reviewing source captures")
    for name, data in images.items():
        p = EVIDENCE / name
        if not p.is_file() or p.read_bytes() != data:
            raise SystemExit(f"Button crop pixel-diff PNG is stale: {name}")
    print("Button crop pixel-diff artifacts are current; parityAccepted=false")

if __name__ == "__main__":
    main()
