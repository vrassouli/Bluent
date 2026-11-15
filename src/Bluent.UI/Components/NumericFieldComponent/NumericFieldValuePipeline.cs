using System.Globalization;
using System.Numerics;
using System.Text;

namespace Bluent.UI.Components.NumericFieldComponent.Internal;

internal enum NumericFieldParseFailure
{
    None,
    Empty,
    Invalid,
    Overflow,
    NonFinite,
}

/// <summary>
/// Culture-aware numeric parsing, formatting and stepping shared by NumericField.
/// The editing buffer is deliberately kept outside this type so parsing never
/// rewrites a user's caret, selection, sign or separator while they are typing.
/// </summary>
internal static class NumericFieldValuePipeline
{
    private const NumberStyles IntegerStyles = NumberStyles.Integer | NumberStyles.AllowThousands;
    private const NumberStyles FloatingStyles = NumberStyles.Float | NumberStyles.AllowThousands;

    public static Type GetUnderlyingType(Type valueType) => Nullable.GetUnderlyingType(valueType) ?? valueType;

    public static bool IsNullable(Type valueType) => Nullable.GetUnderlyingType(valueType) is not null;

    public static bool IsSupportedType(Type valueType)
    {
        var type = GetUnderlyingType(valueType);
        return type == typeof(sbyte) || type == typeof(byte) ||
               type == typeof(short) || type == typeof(ushort) ||
               type == typeof(int) || type == typeof(uint) ||
               type == typeof(long) || type == typeof(ulong) ||
               type == typeof(float) || type == typeof(double) ||
               type == typeof(decimal);
    }

    public static bool TryParse<TValue>(
        string? rawValue,
        CultureInfo culture,
        out TValue result,
        out NumericFieldParseFailure failure)
    {
        result = default!;
        failure = NumericFieldParseFailure.None;

        var valueType = GetUnderlyingType(typeof(TValue));
        if (!IsSupportedType(valueType))
            return Fail(NumericFieldParseFailure.Invalid, out result, out failure);

        if (string.IsNullOrWhiteSpace(rawValue))
        {
            if (IsNullable(typeof(TValue)))
                return true;

            return Fail(NumericFieldParseFailure.Empty, out result, out failure);
        }

        var normalized = NormalizeForParsing(rawValue, culture);
        var numberFormat = (NumberFormatInfo)culture.NumberFormat.Clone();
        // Unicode bidi marks are stripped from the editing string before parsing.
        // Use canonical signs so fa-IR (LRM + U+2212) and ar-EG (ALM + hyphen)
        // parse identically without changing the text the user is editing.
        numberFormat.NegativeSign = "-";
        numberFormat.PositiveSign = "+";

        object? parsed;
        if (valueType == typeof(sbyte))
        {
            if (!BigInteger.TryParse(normalized, IntegerStyles, numberFormat, out var number))
                return Fail(NumericFieldParseFailure.Invalid, out result, out failure);
            if (number < sbyte.MinValue || number > sbyte.MaxValue)
                return Fail(NumericFieldParseFailure.Overflow, out result, out failure);
            parsed = (sbyte)number;
        }
        else if (valueType == typeof(byte))
        {
            if (!BigInteger.TryParse(normalized, IntegerStyles, numberFormat, out var number))
                return Fail(NumericFieldParseFailure.Invalid, out result, out failure);
            if (number < byte.MinValue || number > byte.MaxValue)
                return Fail(NumericFieldParseFailure.Overflow, out result, out failure);
            parsed = (byte)number;
        }
        else if (valueType == typeof(short))
        {
            if (!BigInteger.TryParse(normalized, IntegerStyles, numberFormat, out var number))
                return Fail(NumericFieldParseFailure.Invalid, out result, out failure);
            if (number < short.MinValue || number > short.MaxValue)
                return Fail(NumericFieldParseFailure.Overflow, out result, out failure);
            parsed = (short)number;
        }
        else if (valueType == typeof(ushort))
        {
            if (!BigInteger.TryParse(normalized, IntegerStyles, numberFormat, out var number))
                return Fail(NumericFieldParseFailure.Invalid, out result, out failure);
            if (number < ushort.MinValue || number > ushort.MaxValue)
                return Fail(NumericFieldParseFailure.Overflow, out result, out failure);
            parsed = (ushort)number;
        }
        else if (valueType == typeof(int))
        {
            if (!BigInteger.TryParse(normalized, IntegerStyles, numberFormat, out var number))
                return Fail(NumericFieldParseFailure.Invalid, out result, out failure);
            if (number < int.MinValue || number > int.MaxValue)
                return Fail(NumericFieldParseFailure.Overflow, out result, out failure);
            parsed = (int)number;
        }
        else if (valueType == typeof(uint))
        {
            if (!BigInteger.TryParse(normalized, IntegerStyles, numberFormat, out var number))
                return Fail(NumericFieldParseFailure.Invalid, out result, out failure);
            if (number < uint.MinValue || number > uint.MaxValue)
                return Fail(NumericFieldParseFailure.Overflow, out result, out failure);
            parsed = (uint)number;
        }
        else if (valueType == typeof(long))
        {
            if (!BigInteger.TryParse(normalized, IntegerStyles, numberFormat, out var number))
                return Fail(NumericFieldParseFailure.Invalid, out result, out failure);
            if (number < long.MinValue || number > long.MaxValue)
                return Fail(NumericFieldParseFailure.Overflow, out result, out failure);
            parsed = (long)number;
        }
        else if (valueType == typeof(ulong))
        {
            if (!BigInteger.TryParse(normalized, IntegerStyles, numberFormat, out var number))
                return Fail(NumericFieldParseFailure.Invalid, out result, out failure);
            if (number < ulong.MinValue || number > ulong.MaxValue)
                return Fail(NumericFieldParseFailure.Overflow, out result, out failure);
            parsed = (ulong)number;
        }
        else if (valueType == typeof(decimal))
        {
            if (!decimal.TryParse(normalized, FloatingStyles, numberFormat, out var number))
            {
                if (double.TryParse(normalized, FloatingStyles, numberFormat, out var wide) && !double.IsNaN(wide))
                    return Fail(NumericFieldParseFailure.Overflow, out result, out failure);
                return Fail(NumericFieldParseFailure.Invalid, out result, out failure);
            }
            parsed = number;
        }
        else if (valueType == typeof(float))
        {
            if (!float.TryParse(normalized, FloatingStyles, numberFormat, out var number))
            {
                if (double.TryParse(normalized, FloatingStyles, numberFormat, out var wide) && !double.IsNaN(wide))
                    return Fail(NumericFieldParseFailure.Overflow, out result, out failure);
                return Fail(NumericFieldParseFailure.Invalid, out result, out failure);
            }
            if (!float.IsFinite(number))
                return Fail(NumericFieldParseFailure.NonFinite, out result, out failure);
            parsed = number;
        }
        else if (valueType == typeof(double))
        {
            if (!double.TryParse(normalized, FloatingStyles, numberFormat, out var number))
                return Fail(NumericFieldParseFailure.Overflow, out result, out failure);
            if (!double.IsFinite(number))
                return Fail(NumericFieldParseFailure.NonFinite, out result, out failure);
            parsed = number;
        }
        else
        {
            return Fail(NumericFieldParseFailure.Invalid, out result, out failure);
        }

        result = (TValue)parsed!;
        return true;
    }

    public static string NormalizeForParsing(string rawValue, CultureInfo culture)
    {
        var format = culture.NumberFormat;
        var builder = new StringBuilder(rawValue.Length);

        foreach (var character in rawValue)
        {
            var digit = CharUnicodeInfo.GetDecimalDigitValue(character);
            if (digit >= 0)
            {
                builder.Append((char)('0' + digit));
                continue;
            }

            switch (character)
            {
                case '\u2212': // MINUS SIGN
                case '\uFE63': // SMALL HYPHEN-MINUS
                case '\uFF0D': // FULLWIDTH HYPHEN-MINUS
                    builder.Append('-');
                    break;
                case '\uFF0B': // FULLWIDTH PLUS SIGN
                    builder.Append('+');
                    break;
                case '\u061C': // ARABIC LETTER MARK
                case '\u200E': // LEFT-TO-RIGHT MARK
                case '\u200F': // RIGHT-TO-LEFT MARK
                case '\u202A': // LEFT-TO-RIGHT EMBEDDING
                case '\u202B': // RIGHT-TO-LEFT EMBEDDING
                case '\u202C': // POP DIRECTIONAL FORMATTING
                case '\u2066': // LEFT-TO-RIGHT ISOLATE
                case '\u2067': // RIGHT-TO-LEFT ISOLATE
                case '\u2068': // FIRST STRONG ISOLATE
                case '\u2069': // POP DIRECTIONAL ISOLATE
                    break;

                case '\u066B': // ARABIC DECIMAL SEPARATOR
                    builder.Append(format.NumberDecimalSeparator);
                    break;
                case '.': // ASCII decimal input is common on localized keyboards/paste
                    builder.Append(format.NumberGroupSeparator == "." ? "." : format.NumberDecimalSeparator);
                    break;
                case '\u066C': // ARABIC THOUSANDS SEPARATOR
                    builder.Append(format.NumberGroupSeparator);
                    break;
                case '\u00A0': // NO-BREAK SPACE, common pasted group separator
                case '\u202F': // NARROW NO-BREAK SPACE
                    builder.Append(format.NumberGroupSeparator);
                    break;
                default:
                    builder.Append(character);
                    break;
            }
        }

        return builder.ToString().Trim();
    }

    public static string? Format<TValue>(TValue? value, string? format, CultureInfo culture)
    {
        if (value is null)
            return null;

        if (value is not IFormattable formattable)
            throw new InvalidOperationException($"Unsupported numeric value type '{value.GetType()}'.");

        var numericFormat = string.IsNullOrWhiteSpace(format) ? "G" : format;
        var formatted = formattable.ToString(numericFormat, culture) ?? string.Empty;
        return MapNativeDigits(formatted, culture);
    }

    public static string? FormatAriaValue(object? value)
    {
        if (value is null)
            return null;
        if (value is float floatValue)
            return floatValue.ToString("R", CultureInfo.InvariantCulture);
        if (value is double doubleValue)
            return doubleValue.ToString("R", CultureInfo.InvariantCulture);
        if (value is decimal decimalValue)
            return decimalValue.ToString("G29", CultureInfo.InvariantCulture);
        return value is IFormattable formattable
            ? formattable.ToString("G", CultureInfo.InvariantCulture)
            : null;
    }

    public static string MapNativeDigits(string value, CultureInfo culture)
    {
        var digits = culture.NumberFormat.NativeDigits;
        if (digits.Length != 10 || Enumerable.Range(0, 10).All(index => digits[index] == index.ToString(CultureInfo.InvariantCulture)))
            return value;

        var builder = new StringBuilder(value.Length);
        foreach (var character in value)
        {
            if (character is >= '0' and <= '9')
                builder.Append(digits[character - '0']);
            else
                builder.Append(character);
        }
        return builder.ToString();
    }

    public static bool TryStep<TValue>(
        TValue currentValue,
        TValue stepValue,
        TValue minimum,
        TValue maximum,
        bool hasCurrentValue,
        bool hasMinimum,
        bool hasMaximum,
        int direction,
        out TValue result)
    {
        result = default!;
        if (direction is not (-1 or 1))
            return false;

        var type = GetUnderlyingType(typeof(TValue));
        if (!IsSupportedType(type))
            return false;

        var isFloating = type == typeof(float) || type == typeof(double);
        if (isFloating)
        {
            var intrinsicMin = type == typeof(float) ? (double)-float.MaxValue : -double.MaxValue;
            var intrinsicMax = type == typeof(float) ? (double)float.MaxValue : double.MaxValue;
            var lower = hasMinimum ? Convert.ToDouble(minimum, CultureInfo.InvariantCulture) : intrinsicMin;
            var upper = hasMaximum ? Convert.ToDouble(maximum, CultureInfo.InvariantCulture) : intrinsicMax;
            var step = stepValue is null ? 1d : Convert.ToDouble(stepValue, CultureInfo.InvariantCulture);
            if (!double.IsFinite(step) || step <= 0 || !double.IsFinite(lower) || !double.IsFinite(upper) || lower > upper)
                return false;

            var current = hasCurrentValue
                ? Convert.ToDouble(currentValue, CultureInfo.InvariantCulture)
                : direction > 0 ? (hasMinimum ? lower : 0d) : (hasMaximum ? upper : 0d);
            if (!double.IsFinite(current))
                return false;

            if (hasCurrentValue && current < lower && direction < 0)
                return false;
            if (hasCurrentValue && current > upper && direction > 0)
                return false;

            var candidate = current + (step * direction);
            if (double.IsPositiveInfinity(candidate) || candidate > upper)
                candidate = upper;
            else if (double.IsNegativeInfinity(candidate) || candidate < lower)
                candidate = lower;

            object converted = type == typeof(float) ? checked((float)candidate) : candidate;
            if (converted is float f && !float.IsFinite(f))
                return false;
            result = (TValue)converted;
            return true;
        }

        var typeMin = GetIntegralOrDecimalMinimum(type);
        var typeMax = GetIntegralOrDecimalMaximum(type);
        var lowerDecimal = hasMinimum
            ? Math.Max(typeMin, Convert.ToDecimal(minimum, CultureInfo.InvariantCulture))
            : typeMin;
        var upperDecimal = hasMaximum
            ? Math.Min(typeMax, Convert.ToDecimal(maximum, CultureInfo.InvariantCulture))
            : typeMax;
        var stepDecimal = stepValue is null ? 1m : Convert.ToDecimal(stepValue, CultureInfo.InvariantCulture);
        if (stepDecimal <= 0 || lowerDecimal > upperDecimal)
            return false;

        var currentDecimal = hasCurrentValue
            ? Convert.ToDecimal(currentValue, CultureInfo.InvariantCulture)
            : direction > 0 ? (hasMinimum ? lowerDecimal : 0m) : (hasMaximum ? upperDecimal : 0m);

        if (hasCurrentValue && currentDecimal < lowerDecimal && direction < 0)
            return false;
        if (hasCurrentValue && currentDecimal > upperDecimal && direction > 0)
            return false;

        try
        {
            var candidateDecimal = currentDecimal + (stepDecimal * direction);
            candidateDecimal = Math.Clamp(candidateDecimal, lowerDecimal, upperDecimal);
            object convertedDecimal = Convert.ChangeType(candidateDecimal, type, CultureInfo.InvariantCulture);
            result = (TValue)convertedDecimal;
            return true;
        }
        catch (OverflowException)
        {
            return false;
        }
    }
    public static bool IsFinite(object? value)
    {
        if (value is null)
            return false;
        return value switch
        {
            float f => float.IsFinite(f),
            double d => double.IsFinite(d),
            _ => true,
        };
    }

    public static bool IsPositiveFinite<TValue>(TValue? value)
    {
        if (value is null)
            return false;
        var type = GetUnderlyingType(typeof(TValue));
        if (type == typeof(float))
        {
            var number = Convert.ToSingle(value, CultureInfo.InvariantCulture);
            return float.IsFinite(number) && number > 0;
        }
        if (type == typeof(double))
        {
            var number = Convert.ToDouble(value, CultureInfo.InvariantCulture);
            return double.IsFinite(number) && number > 0;
        }
        try
        {
            return Convert.ToDecimal(value, CultureInfo.InvariantCulture) > 0;
        }
        catch (OverflowException)
        {
            return false;
        }
    }

    public static int Compare<TValue>(TValue? left, TValue? right)
    {
        if (left is null)
            return right is null ? 0 : -1;
        if (right is null)
            return 1;

        var type = GetUnderlyingType(typeof(TValue));
        if (type == typeof(float) || type == typeof(double))
            return Convert.ToDouble(left, CultureInfo.InvariantCulture).CompareTo(Convert.ToDouble(right, CultureInfo.InvariantCulture));

        return Convert.ToDecimal(left, CultureInfo.InvariantCulture).CompareTo(Convert.ToDecimal(right, CultureInfo.InvariantCulture));
    }

    private static decimal GetIntegralOrDecimalMinimum(Type type) => type == typeof(sbyte) ? sbyte.MinValue
        : type == typeof(byte) ? byte.MinValue
        : type == typeof(short) ? short.MinValue
        : type == typeof(ushort) ? ushort.MinValue
        : type == typeof(int) ? int.MinValue
        : type == typeof(uint) ? uint.MinValue
        : type == typeof(long) ? long.MinValue
        : type == typeof(ulong) ? ulong.MinValue
        : decimal.MinValue;

    private static decimal GetIntegralOrDecimalMaximum(Type type) => type == typeof(sbyte) ? sbyte.MaxValue
        : type == typeof(byte) ? byte.MaxValue
        : type == typeof(short) ? short.MaxValue
        : type == typeof(ushort) ? ushort.MaxValue
        : type == typeof(int) ? int.MaxValue
        : type == typeof(uint) ? uint.MaxValue
        : type == typeof(long) ? long.MaxValue
        : type == typeof(ulong) ? ulong.MaxValue
        : decimal.MaxValue;

    private static bool Fail<TValue>(NumericFieldParseFailure parseFailure, out TValue result, out NumericFieldParseFailure failure)
    {
        result = default!;
        failure = parseFailure;
        return false;
    }
}
