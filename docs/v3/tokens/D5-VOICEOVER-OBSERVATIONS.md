# D5 native VoiceOver observation — #418

Date: 2026-10-12. Research draft; not complete AT signoff.

MacBook3 had macOS VoiceOver running, Safari 27.0.1 running the actual release-published Blazor InteractiveServer v3 lab in a temporary task-branch worktree. Original Mac Dev checkout was unchanged.

Native macOS Accessibility UI tree exposed a named Dialog group, h2 heading, visible description, localized close button and focused text field. With VoiceOver active, its caption panel reported an interactive button inside a web dialog. Activating the Bluent title-change button using the VoiceOver shortcut Control+Option+Space changed the title to Persian: «تأیید درخواست - عنوان جدید». The native accessibility tree changed its group/heading name, and the VoiceOver caption panel presented this Persian title, “web dialog” and “heading level 2”. This is native VoiceOver output, distinct from earlier WebDriver and Chromium accessibility-tree checks.

The caption panel displays what VoiceOver speaks (Apple documentation: https://support.apple.com/guide/voiceover/use-the-braille-and-caption-panel-unac078/10/mac/27). No audio recording or private desktop screenshot was saved.

Remaining native gates: read entire description, VoiceOver-mediated dialog closure and focus return, nested Popover traversal, Persian validation and complete AT review. Thus the result is PARTIAL native VoiceOver verification, not a WCAG or complete accessibility certification.

Keep issue #418 In progress, PR #500 Draft targeting bluent-v3, #420 Backlog. No stable Dev merge or NuGet release.
