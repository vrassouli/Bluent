using Bluent.UI.Extensions;

namespace Bluent.UI.Components;

/// <summary>
/// Applies the existing TextField input transformations in their documented order.
/// Kept independent from rendering so the behavior can be tested without a browser.
/// </summary>
internal static class TextFieldValuePipeline
{
    public static string? Normalize(
        string? value,
        bool digitOnly,
        bool asciiDigits,
        bool arabicToPersianConversion)
    {
        if (digitOnly)
            value = value?.ToDigits();

        if (asciiDigits)
            value = value?.ToAsciiDigits();

        if (arabicToPersianConversion)
            value = value?.ToPersianChars();

        return value;
    }
}
