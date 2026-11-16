using System.Globalization;
using Bluent.UI.Components.NumericFieldComponent.Internal;

namespace RegexSampleGeneratorTest;

public class NumericFieldValuePipelineTests
{
    [TestCase("-12.50", "en-US", -12.50)]
    [TestCase("1.234,50", "de-DE", 1234.50)]
    [TestCase("\u200E\u2212\u06F1\u06F2\u066B\u06F5\u06F0", "fa-IR", -12.50)]
    [TestCase("\u061C-\u0661\u0662\u066B\u0665\u0660", "ar-EG", -12.50)]
    public void TryParse_decimal_accepts_culture_separators_and_native_digits(string input, string cultureName, double expected)
    {
        var culture = CultureInfo.GetCultureInfo(cultureName);
        var success = NumericFieldValuePipeline.TryParse<decimal>(input, culture, out var value, out var failure);
        Assert.Multiple(() =>
        {
            Assert.That(success, Is.True);
            Assert.That(failure, Is.EqualTo(NumericFieldParseFailure.None));
            Assert.That(value, Is.EqualTo((decimal)expected));
        });
    }

    [TestCase("-12.50", "fa-IR", -12.50)]
    [TestCase("-12.50", "ar-EG", -12.50)]
    public void TryParse_accepts_ascii_decimal_point_when_it_is_not_the_group_separator(string input, string cultureName, double expected)
    {
        var success = NumericFieldValuePipeline.TryParse<decimal>(input, CultureInfo.GetCultureInfo(cultureName), out var value, out var failure);
        Assert.Multiple(() =>
        {
            Assert.That(success, Is.True);
            Assert.That(failure, Is.EqualTo(NumericFieldParseFailure.None));
            Assert.That(value, Is.EqualTo((decimal)expected));
        });
    }

    [Test]
    public void TryParse_preserves_sign_and_decimal_punctuation_in_the_editing_string()
    {
        const string input = "-12.50";
        Assert.That(NumericFieldValuePipeline.NormalizeForParsing(input, CultureInfo.GetCultureInfo("en-US")), Is.EqualTo(input));
    }

    [Test]
    public void TryParse_nullable_integer_accepts_empty_input_as_null()
    {
        var success = NumericFieldValuePipeline.TryParse<int?>("  ", CultureInfo.InvariantCulture, out var value, out var failure);
        Assert.Multiple(() =>
        {
            Assert.That(success, Is.True);
            Assert.That(value, Is.Null);
            Assert.That(failure, Is.EqualTo(NumericFieldParseFailure.None));
        });
    }

    [Test]
    public void TryParse_non_nullable_integer_rejects_empty_input()
    {
        var success = NumericFieldValuePipeline.TryParse<int>(string.Empty, CultureInfo.InvariantCulture, out _, out var failure);
        Assert.Multiple(() =>
        {
            Assert.That(success, Is.False);
            Assert.That(failure, Is.EqualTo(NumericFieldParseFailure.Empty));
        });
    }

    [TestCase("2147483648", "Overflow")]
    [TestCase("not a number", "Invalid")]
    [TestCase("1.25", "Invalid")]
    public void TryParse_integer_distinguishes_overflow_from_invalid_text(string input, string expectedFailureName)
    {
        var success = NumericFieldValuePipeline.TryParse<int>(input, CultureInfo.GetCultureInfo("en-US"), out _, out var failure);
        Assert.Multiple(() =>
        {
            Assert.That(success, Is.False);
            Assert.That(failure.ToString(), Is.EqualTo(expectedFailureName));
        });
    }

    [Test]
    public void TryParse_accepts_mixed_latin_persian_and_arabic_digits()
    {
        var success = NumericFieldValuePipeline.TryParse<int>("1\u06F2\u0663\u06F4", CultureInfo.InvariantCulture, out var value, out var failure);
        Assert.Multiple(() =>
        {
            Assert.That(success, Is.True);
            Assert.That(value, Is.EqualTo(1234));
            Assert.That(failure, Is.EqualTo(NumericFieldParseFailure.None));
        });
    }

    [Test]
    public void TryParse_rejects_non_finite_floating_values()
    {
        var success = NumericFieldValuePipeline.TryParse<double>("NaN", CultureInfo.InvariantCulture, out _, out var failure);
        Assert.Multiple(() =>
        {
            Assert.That(success, Is.False);
            Assert.That(failure, Is.EqualTo(NumericFieldParseFailure.NonFinite));
        });
    }

    [Test]
    public void TryParse_double_reports_malformed_text_as_invalid_not_overflow()
    {
        var malformed = NumericFieldValuePipeline.TryParse<double>("not a number", CultureInfo.GetCultureInfo("en-US"), out _, out var malformedFailure);
        var tooLarge = NumericFieldValuePipeline.TryParse<double>("1e9999", CultureInfo.GetCultureInfo("en-US"), out _, out var overflowFailure);

        Assert.Multiple(() =>
        {
            Assert.That(malformed, Is.False);
            Assert.That(malformedFailure, Is.EqualTo(NumericFieldParseFailure.Invalid));
            Assert.That(tooLarge, Is.False);
            Assert.That(overflowFailure, Is.EqualTo(NumericFieldParseFailure.NonFinite));
        });
    }

    [Test]
    public void TryStep_decimal_clamps_at_maximum_without_intermediate_overflow()
    {
        var success = NumericFieldValuePipeline.TryStep<decimal>(
            decimal.MaxValue - 1m, decimal.MaxValue, decimal.MinValue, decimal.MaxValue,
            true, true, true, 1, out var result);

        Assert.Multiple(() =>
        {
            Assert.That(success, Is.True);
            Assert.That(result, Is.EqualTo(decimal.MaxValue));
        });
    }

    [Test]
    public void TryStep_decimal_clamps_at_minimum_without_intermediate_underflow()
    {
        var success = NumericFieldValuePipeline.TryStep<decimal>(
            decimal.MinValue + 1m, decimal.MaxValue, decimal.MinValue, decimal.MaxValue,
            true, true, true, -1, out var result);

        Assert.Multiple(() =>
        {
            Assert.That(success, Is.True);
            Assert.That(result, Is.EqualTo(decimal.MinValue));
        });
    }

    [Test]
    public void Format_uses_fa_IR_native_digits_and_negative_sign()
    {
        var formatted = NumericFieldValuePipeline.Format(-12.5m, "N2", CultureInfo.GetCultureInfo("fa-IR"));
        Assert.That(formatted, Is.EqualTo("\u200E\u2212\u06F1\u06F2\u066B\u06F5\u06F0"));
    }

    [Test]
    public void Format_uses_arabic_indic_digits_and_sign_for_ar_EG()
    {
        var formatted = NumericFieldValuePipeline.Format(-12.5m, "N1", CultureInfo.GetCultureInfo("ar-EG"));
        Assert.That(formatted, Is.EqualTo("\u061C-\u0661\u0662\u066B\u0665"));
    }

    [Test]
    public void TryStep_decimal_does_not_accumulate_binary_fraction_drift()
    {
        Assert.That(NumericFieldValuePipeline.TryStep<decimal>(0.2m, 0.1m, default, default, true, false, false, 1, out decimal next), Is.True);
        Assert.That(next, Is.EqualTo(0.3m));
        Assert.That(NumericFieldValuePipeline.TryStep<decimal>(next, 0.1m, default, default, true, false, false, 1, out decimal nextAgain), Is.True);
        Assert.That(nextAgain, Is.EqualTo(0.4m));
    }

    [Test]
    public void TryStep_empty_value_starts_from_explicit_minimum_then_steps()
    {
        var success = NumericFieldValuePipeline.TryStep<int?>(null, 2, 5, 10, false, true, true, 1, out var result);
        Assert.Multiple(() =>
        {
            Assert.That(success, Is.True);
            Assert.That(result, Is.EqualTo(7));
        });
    }

    [Test]
    public void TryStep_out_of_range_value_recovers_toward_the_inclusive_range()
    {
        var success = NumericFieldValuePipeline.TryStep<int>(12, 1, 0, 10, true, true, true, -1, out int result);
        Assert.Multiple(() =>
        {
            Assert.That(success, Is.True);
            Assert.That(result, Is.EqualTo(10));
        });
    }

    [Test]
    public void TryStep_out_of_range_value_applies_the_configured_step_toward_the_range()
    {
        var success = NumericFieldValuePipeline.TryStep<int?>(-1, 5, 0, 100, true, true, true, 1, out var result);

        Assert.Multiple(() =>
        {
            Assert.That(success, Is.True);
            Assert.That(result, Is.EqualTo(4));
        });
    }

    [Test]
    public void TryStep_does_not_step_an_out_of_range_value_away_from_its_range()
    {
        Assert.That(NumericFieldValuePipeline.TryStep<int>(12, 1, 0, 10, true, true, true, 1, out _), Is.False);
    }

    [Test]
    public void TryStep_clamps_at_the_upper_and_lower_bounds()
    {
        Assert.Multiple(() =>
        {
            Assert.That(NumericFieldValuePipeline.TryStep<int>(10, 1, 0, 10, true, true, true, 1, out int upper), Is.True);
            Assert.That(upper, Is.EqualTo(10));
            Assert.That(NumericFieldValuePipeline.TryStep<int>(0, 1, 0, 10, true, true, true, -1, out int lower), Is.True);
            Assert.That(lower, Is.EqualTo(0));
        });
    }

    [Test]
    public void TryStep_handles_unsigned_minimum_without_underflow()
    {
        var success = NumericFieldValuePipeline.TryStep<byte>((byte)0, (byte)1, default, default, true, false, false, -1, out byte result);
        Assert.Multiple(() =>
        {
            Assert.That(success, Is.True);
            Assert.That(result, Is.EqualTo((byte)0));
        });
    }

    [Test]
    public void TryStep_accepts_nullable_values_and_round_trips_the_boxed_value()
    {
        var success = NumericFieldValuePipeline.TryStep<int?>(5, 1, null, null, true, false, false, 1, out var result);
        Assert.Multiple(() =>
        {
            Assert.That(success, Is.True);
            Assert.That(result, Is.EqualTo(6));
        });
    }
}
