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


if __name__ == "__main__":
    unittest.main()
