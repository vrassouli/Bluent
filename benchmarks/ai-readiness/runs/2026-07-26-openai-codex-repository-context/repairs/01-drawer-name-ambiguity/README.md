# Repair 1 — qualify generated drawer content

## First build result

The unchanged aggregate build failed with:

```text
Pages/Samples/DrawerAndPopover.razor(31,52): error CS0104:
'DrawerContent' is an ambiguous reference between
'Bluent.AiReadiness.Generated.Shared.DrawerContent' and
'Bluent.UI.Components.DrawerContent'
```

The generated component name collided with an imported public Bluent type.

## Attempted repair

[`RepairAliases.cs`](RepairAliases.cs) adds one global alias selecting the
generated content component. No first-pass Razor file was edited for this
attempt. Razor compilation still reported the same `CS0104` ambiguity, so this
attempt did not compile and is retained as negative evidence.

Run the repair build with:

```bash
dotnet build \
  benchmarks/ai-readiness/runs/2026-07-26-openai-codex-repository-context/samples/Bluent.AiReadiness.Generated.csproj \
  --configuration Release --no-restore -warnaserror \
  -p:ApplyDrawerRepair=true
```

The successful repair is recorded separately in
[`../02-fully-qualified-drawer-content/README.md`](../02-fully-qualified-drawer-content/README.md).
