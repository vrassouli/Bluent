using Microsoft.AspNetCore.Components;
using System.Diagnostics.CodeAnalysis;
using Bluent.UI.Extensions;

namespace Bluent.UI.Components;

public partial class TextField
{
    [Parameter] public int? Rows { get; set; }
    [Parameter] public bool ResizeTextarea { get; set; }
    [Parameter] public bool GainFocus { get; set; }
    [Parameter] public bool DigitOnly { get; set; }
    [Parameter] public bool EnglishDigits { get; set; }
    [Parameter] public bool ArabicToPersianConvertion { get; set; }

    protected string? ValueStringProxy
    {
        get
        {
            return CurrentValueAsString;
        }
        set
        {
            if (DigitOnly)
                value = value?.ToDigits();

            if (EnglishDigits)
                value = value?.ToEnglishDigits();

            if (ArabicToPersianConvertion)
                value = value?.ToPersianChars();
            
            CurrentValueAsString = value;
        }
    }
    
    protected override Task OnAfterRenderAsync(bool firstRender)
    {
        if (firstRender && GainFocus && Element != null)
        {
            InvokeAsync(() => Element.Value.FocusAsync());
        }
        return base.OnAfterRenderAsync(firstRender);
    }

    protected override IEnumerable<string> GetClasses()
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
