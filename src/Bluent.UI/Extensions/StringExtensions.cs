using System.Globalization;
using System.Text;

namespace Bluent.UI.Extensions;

public static class StringExtensions
{
    public static string ToPersianChars(this string input, bool fullNormalize = false)
    {
        if (string.IsNullOrEmpty(input))
            return input;

        var builder = (StringBuilder?)null;
        for (var i = 0; i < input.Length; i++)
        {
            var c = input[i];
            if (fullNormalize && (c == 'ـ' || c == 'ء' || IsArabicDiacritic(c)))
            {
                builder ??= new StringBuilder(input.Length).Append(input, 0, i);
                continue;
            }

            var normalized = NormalizePersianChar(c, fullNormalize);
            if (builder != null)
            {
                builder.Append(normalized);
                continue;
            }

            if (normalized == c)
                continue;

            builder = new StringBuilder(input.Length).Append(input, 0, i);
            builder.Append(normalized);
        }

        return builder?.ToString() ?? input;
    }

    public static string ToAsciiDigits(this string input, bool fullNormalize = false, CultureInfo? cultureInfo = null)
    {
        if (string.IsNullOrEmpty(input))
            return input;

        var numberFormat = fullNormalize ? (cultureInfo ?? CultureInfo.CurrentCulture).NumberFormat : null;
        var builder = (StringBuilder?)null;
        for (var i = 0; i < input.Length; i++)
        {
            var c = input[i];
            var normalizedChar = c switch
            {
                >= '۰' and <= '۹' => (char?)('0' + c - '۰'),
                >= '٠' and <= '٩' => (char)('0' + c - '٠'),
                _ => null
            };

            if (normalizedChar != null)
            {
                builder ??= new StringBuilder(input.Length).Append(input, 0, i);
                builder.Append(normalizedChar.Value);
                continue;
            }

            var normalizedString = c switch
            {
                '٫' when fullNormalize => numberFormat!.NumberDecimalSeparator,
                '٬' when fullNormalize => numberFormat!.NumberGroupSeparator,
                _ => null
            };

            if (normalizedString == null)
            {
                if (builder != null)
                    builder.Append(c);

                continue;
            }

            builder ??= new StringBuilder(input.Length).Append(input, 0, i);
            builder.Append(normalizedString);
        }
        
        return builder?.ToString() ?? input;
    }

    public static string ToDigits(this string input)
    {
        if (string.IsNullOrEmpty(input))
            return input;

        var builder = (StringBuilder?)null;

        for (var i = 0; i < input.Length; i++)
        {
            var c = input[i];
            if (!IsDigit(c))
            {
                builder ??= new StringBuilder(input.Length).Append(input, 0, i);
                continue;
            }

            if (builder != null)
                builder.Append(c);
        }

        return builder?.ToString() ?? input;
    }

    private static char NormalizePersianChar(char c, bool fullNormalize)
    {
        return c switch
        {
            'ك' => 'ک',
            'ي' or 'ى' => 'ی',
            _ when !fullNormalize => c,
            'ؤ' => 'و',
            'أ' or 'إ' or 'ٱ' => 'ا',
            'ة' or 'ۀ' => 'ه',
            'ئ' => 'ی',
            _ => c
        };
    }

    private static bool IsArabicDiacritic(char c)
    {
        return c is (>= '\u0610' and <= '\u061A')
            or (>= '\u064B' and <= '\u065F')
            or '\u0670'
            or (>= '\u06D6' and <= '\u06ED');
    }

    private static bool IsDigit(char c)
    {
        return c is (>= '0' and <= '9')
            or (>= '۰' and <= '۹')
            or (>= '٠' and <= '٩');
    }

}