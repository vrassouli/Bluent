#!/usr/bin/env python3

import tempfile
import unittest
from argparse import Namespace
from pathlib import Path
import sys

sys.path.insert(0, str(Path(__file__).parent))
import release_tools


class ReleaseToolsTests(unittest.TestCase):
    def test_accepts_stable_and_prerelease_versions(self) -> None:
        release_tools.validate_version("1.2.3")
        release_tools.validate_version("2.0.0-preview.1")

    def test_rejects_ambiguous_nuget_versions(self) -> None:
        for version in ("v1.2.3", "1.02.3", "1.2", "1.2.3+build.1"):
            with self.subTest(version=version):
                with self.assertRaises(ValueError):
                    release_tools.validate_version(version)

    def test_changelog_section_stops_at_next_level_two_heading(self) -> None:
        text = """# Changelog

## [Unreleased]

### Added

- A change.

## Release History

Historical prose.
"""
        section = release_tools.changelog_section(text, "Unreleased")
        self.assertIsNotNone(section)
        self.assertNotIn("Release History", section)

    def test_publish_notes_require_exact_version_section(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            changelog = root / "CHANGELOG.md"
            changelog.write_text(
                "## [Unreleased]\n\n### Added\n\n- A change.\n",
                encoding="utf-8",
            )
            with self.assertRaises(ValueError):
                release_tools.extract_notes(
                    Namespace(
                        changelog=changelog,
                        version="1.2.3",
                        output=root / "notes.md",
                        allow_unreleased=False,
                    )
                )

    def test_dry_run_uses_latest_release_when_unreleased_is_empty(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            changelog = root / "CHANGELOG.md"
            output = root / "notes.md"
            changelog.write_text(
                """## [Unreleased]

### Added

- None.

## [1.2.3] - 2026-07-26

### Fixed

- A released fix.
""",
                encoding="utf-8",
            )
            release_tools.extract_notes(
                Namespace(
                    changelog=changelog,
                    version="0.0.0-ci.1",
                    output=output,
                    allow_unreleased=True,
                )
            )
            notes = output.read_text(encoding="utf-8")
            self.assertIn("generated from [1.2.3]", notes)
            self.assertIn("- A released fix.", notes)

    def test_accepts_nuget_trusted_readme_image_sources(self) -> None:
        readme = """\
![NuGet](https://img.shields.io/nuget/v/Bluent.UI.svg)
![Demo](https://raw.githubusercontent.com/owner/repo/commit/demo.jpg)
![Build][build-badge]
<img src="https://i.imgur.com/example.png" alt="Example">

[build-badge]: https://github.com/owner/repo/actions/workflows/build.yml/badge.svg
"""
        self.assertEqual(
            release_tools.validate_readme_images(readme, "Bluent.UI"),
            [
                "https://img.shields.io/nuget/v/Bluent.UI.svg",
                "https://raw.githubusercontent.com/owner/repo/commit/demo.jpg",
                "https://github.com/owner/repo/actions/workflows/build.yml/badge.svg",
                "https://i.imgur.com/example.png",
            ],
        )

    def test_rejects_unsupported_readme_image_sources(self) -> None:
        sources = (
            "docs/demo.jpg",
            "http://img.shields.io/example.svg",
            "https://example.com/example.png",
        )
        for source in sources:
            with self.subTest(source=source):
                with self.assertRaisesRegex(
                    ValueError, "NuGet.org will not render"
                ):
                    release_tools.validate_readme_images(
                        f"![Example]({source})", "Bluent.UI"
                    )


if __name__ == "__main__":
    unittest.main()
