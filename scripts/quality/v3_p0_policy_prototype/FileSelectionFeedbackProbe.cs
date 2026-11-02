using Microsoft.AspNetCore.Components;
using Microsoft.AspNetCore.Components.Rendering;

internal sealed class FileSelectionFeedbackProbe : ComponentBase
{
    [Parameter] public IReadOnlyList<string> SelectedNames { get; set; } = Array.Empty<string>();
    [Parameter] public string? Error { get; set; }
    [Parameter] public string RemoveVerb { get; set; } = "Remove";

    // QA-only proposed markup: no Bluent UI component is changed by this sample.
    protected override void BuildRenderTree(RenderTreeBuilder b)
    {
        b.OpenElement(0, "div");
        b.AddAttribute(1, "class", "qa-file-selection");

        if (!string.IsNullOrEmpty(Error))
        {
            b.OpenElement(2, "p");
            b.AddAttribute(3, "role", "alert");
            b.AddContent(4, Error);
            b.CloseElement();
        }

        foreach (var name in SelectedNames)
        {
            b.OpenElement(5, "div");
            b.AddAttribute(6, "class", "qa-file-card");
            b.OpenElement(7, "span");
            b.AddContent(8, name);
            b.CloseElement();

            b.OpenElement(9, "button");
            b.AddAttribute(10, "type", "button");
            b.AddAttribute(11, "aria-label", $"{RemoveVerb} {name}");
            b.AddContent(12, "×");
            b.CloseElement();
            b.CloseElement();
        }

        b.CloseElement();
    }
}
