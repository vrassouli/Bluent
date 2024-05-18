using Microsoft.AspNetCore.Components;
using System.Diagnostics.CodeAnalysis;

namespace Bluent.UI.Components;

public partial class TextField
{
    [Parameter] public int? Rows { get; set; }
    [Parameter] public bool ResizeTextarea { get; set; }

    public override IEnumerable<string> GetClasses()
    {
        foreach (var c in base.GetClasses())
            yield return c;

        yield return "bui-text-field";

        if (Rows != null && !ResizeTextarea)
            yield return "no-resize";
    }

    protected override bool TryParseValueFromString(string? value, out string? result, [NotNullWhen(false)] out string? validationErrorMessage)
    {
        result = value;
        validationErrorMessage = null;
        return true;
    }
}
