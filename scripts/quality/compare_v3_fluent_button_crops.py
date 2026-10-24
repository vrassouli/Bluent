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


def _chunk(kind: bytes, payload: bytes) -> bytes:
    return struct.pack(">I", len(payload)) + kind + payload + struct.pack(">I", zlib.crc32(kind + payload) & 0xffffffff)


def encode_png_rgb(width: int, height: int, rgb: bytes) -> bytes:
    if len(rgb) != width * height * 3:
        raise ValueError("Invalid RGB byte count for PNG writer")
    rows = b"".join(b"\x00" + rgb[y * width * 3:(y + 1) * width * 3] for y in range(height))
    header = struct.pack(">IIBBBBB", width, height, 8, 2, 0, 0, 0)
    return PNG_SIGNATURE + _chunk(b"IHDR", header) + _chunk(b"IDAT", zlib.compress(rows, 9)) + _chunk(b"IEND", b"")


def build():
    comparisons, images = [], {}
    for mode, (official_name, bluent_name, diff_name) in PAIR_NAMES.items():
        official_path, bluent_path = EVIDENCE / official_name, EVIDENCE / bluent_name
        ow, oh, official_rgb, official_hash = decode_png_rgb(official_path)
        bw, bh, bluent_rgb, bluent_hash = decode_png_rgb(bluent_path)
        if (ow, oh) != (96, 32) or (bw, bh) != (96, 32):
            raise ValueError(f"{mode}: expected both actual host crops to be exactly 96x32, got Fluent {ow}x{oh}, Bluent {bw}x{bh}")
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
        "algorithm": {"channels": "RGB only; PNG alpha ignored", "changedPixel": "at least one RGB channel differs by at least 1", "meanAbsoluteChannelDifference": "mean absolute RGB-channel delta over all pixels", "differenceImage": "per-channel absolute difference multiplied by 3 and clamped to 255"},
        "comparisons": comparisons,
        "status": "diagnostic_pixel_difference_not_parity_approval",
        "parityAccepted": False,
        "acceptanceLimitations": ["This does not align Fluent/Bluent token systems, font rendering, internal markup, or the approved Penpot design.", "A changed-pixel ratio is extremely sensitive and is not a perceptual quality score or pass threshold.", "Only the primary Button in two visual modes is covered; other Button appearances/states and other 17 families are not.", "The crop excludes outside focus/box-shadow pixels and the application scaffolding.", "No native OS high-contrast or assistive-technology acceptance is implied."],
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
