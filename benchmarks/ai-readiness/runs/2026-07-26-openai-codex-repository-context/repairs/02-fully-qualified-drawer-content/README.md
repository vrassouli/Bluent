# Repair 2 — fully qualify generated drawer content

The preserved
[`first-pass/DrawerAndPopover.razor`](../../first-pass/DrawerAndPopover.razor)
used the ambiguous type name `DrawerContent`. The repaired sample changes only
that generic type argument to:

```csharp
Bluent.AiReadiness.Generated.Shared.DrawerContent
```

The repaired file is
[`samples/Pages/Samples/DrawerAndPopover.razor`](../../samples/Pages/Samples/DrawerAndPopover.razor).
The remaining first-pass sources are unchanged. A successful aggregate build
after this repair counts nine samples compiled unchanged and one sample
compiled after a documented repair.
