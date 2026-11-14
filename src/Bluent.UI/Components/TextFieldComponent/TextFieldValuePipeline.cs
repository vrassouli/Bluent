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

    /// <summary>
    /// Normalizes a value and maps native UTF-16 selection offsets through the same
    /// transformations. Offsets are mapped by normalizing the source prefix, so
    /// removed characters before the caret/selection do not move it to the end.
    /// </summary>
    public static TextFieldValueNormalization NormalizeWithSelection(
        string? value,
        int? selectionStart,
        int? selectionEnd,
        bool digitOnly,
        bool asciiDigits,
        bool arabicToPersianConversion)
    {
        var normalizedValue = Normalize(
            value,
            digitOnly,
            asciiDigits,
            arabicToPersianConversion);

        var source = value ?? string.Empty;
        return new TextFieldValueNormalization(
            normalizedValue,
            MapSelectionOffset(source, selectionStart, digitOnly, asciiDigits, arabicToPersianConversion),
            MapSelectionOffset(source, selectionEnd, digitOnly, asciiDigits, arabicToPersianConversion));
    }

    private static int? MapSelectionOffset(
        string source,
        int? offset,
        bool digitOnly,
        bool asciiDigits,
        bool arabicToPersianConversion)
    {
        if (offset is null)
            return null;

        // HTML input selection offsets are UTF-16 code-unit offsets.
        var boundedOffset = Math.Clamp(offset.Value, 0, source.Length);
        var sourcePrefix = source[..boundedOffset];
        return Normalize(sourcePrefix, digitOnly, asciiDigits, arabicToPersianConversion)?.Length ?? 0;
    }
}

internal readonly record struct TextFieldValueNormalization(
    string? Value,
    int? SelectionStart,
    int? SelectionEnd);