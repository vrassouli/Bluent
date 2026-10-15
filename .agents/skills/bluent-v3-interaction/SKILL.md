# Bluent v3 Interaction Primitives · #420

Read docs/v3/architecture/ADR-0002-interaction-primitives.md, AGENTS.md and the v3 workflow and branching contracts before changing any component.

This issue is PROPOSED / In progress, not approved public Blazor API. The actual owned Penpot v3 board #501 and #417 architecture are reference sources only; the #420-specific design flow still requires editable designer approval. Figma fallback X6Ima16GAyuk7dVUjGgIkt was created but writing is temporarily limited.

Source audit: python scripts/quality/check_v3_interaction_primitives.py. Unit tests: python -m unittest discover -s scripts/quality -p test_v3_interaction_primitives.py -v and python -m unittest discover -s scripts/quality -p test_v3_interaction_sample.py -v. Compile actual consumer example with dotnet build samples/Bluent.TaskExamples/Bluent.TaskExamples.csproj -c Release -warnaserror.

Baseline source: six interop source files + DomHelper, five existing async void methods and eleven catch(Exception) sites. These are grandfathered source debts ONLY, not accepted lifecycle design or runtime compliance. New async void and broad Exception catches must fail the guard; reducing debt is allowed. Do not refactor shared base or public callback signature before exact API/migration + browser review.

Working sample V3InteractionConventions.razor uses existing EditContext, TextField and Checkbox two-way binding, Task SaveAsync, disabled+aria-busy, validation messages and live status. It is BUILD evidence only. Actual focus trap/return, JS disconnection/disposal, overlay portals, keyboard/RTL and screen reader behavior still require component-specific runtime tests. Never merge into stable Dev or publish v3 NuGet without separate approval.
