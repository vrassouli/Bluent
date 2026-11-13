using Bluent.UI.Components;

namespace RegexSampleGeneratorTest;

public class TextFieldValuePipelineTests
{
    [TestCase(false, false, false, "A\u0661\u06F2\u06F3\u0664-5 \u0643 \u064A", "A\u0661\u06F2\u06F3\u0664-5 \u0643 \u064A")]
    [TestCase(true,  false, false, "A\u0661\u06F2\u06F3\u0664-5 \u0643 \u064A", "\u0661\u06F2\u06F3\u06645")]
    [TestCase(false, true,  false, "A\u0661\u06F2\u06F3\u0664-5 \u0643 \u064A", "A1234-5 \u0643 \u064A")]
    [TestCase(false, false, true,  "A\u0661\u06F2\u06F3\u0664-5 \u0643 \u064A", "A\u0661\u06F2\u06F3\u0664-5 \u06A9 \u06CC")]
    [TestCase(true,  true,  false, "A\u0661\u06F2\u06F3\u0664-5 \u0643 \u064A", "12345")]
    [TestCase(true,  false, true,  "A\u0661\u06F2\u06F3\u0664-5 \u0643 \u064A", "\u0661\u06F2\u06F3\u06645")]
    [TestCase(false, true,  true,  "A\u0661\u06F2\u06F3\u0664-5 \u0643 \u064A", "A1234-5 \u06A9 \u06CC")]
    [TestCase(true,  true,  true,  "A\u0661\u06F2\u06F3\u0664-5 \u0643 \u064A", "12345")]
    public void Normalize_preserves_all_eight_flag_combinations(
        bool digitOnly,
        bool asciiDigits,
        bool arabicToPersianConversion,
        string input,
        string expected)
    {
        var actual = TextFieldValuePipeline.Normalize(
            input,
            digitOnly,
            asciiDigits,
            arabicToPersianConversion);

        Assert.That(actual, Is.EqualTo(expected));
    }

    [Test]
    public void Normalize_preserves_null_when_all_transforms_are_enabled()
    {
        Assert.That(
            TextFieldValuePipeline.Normalize(null, true, true, true),
            Is.Null);
    }

    [Test]
    public void Normalize_preserves_empty_string_when_all_transforms_are_enabled()
    {
        Assert.That(
            TextFieldValuePipeline.Normalize(string.Empty, true, true, true),
            Is.Empty);
    }

    [Test]
    public void NormalizeWithSelection_maps_collapsed_caret_after_persian_digit_to_normalized_index()
    {
        var result = TextFieldValuePipeline.NormalizeWithSelection(
            "12\u06F9345",
            selectionStart: 3,
            selectionEnd: 3,
            digitOnly: false,
            asciiDigits: true,
            arabicToPersianConversion: false);

        Assert.Multiple(() =>
        {
            Assert.That(result.Value, Is.EqualTo("129345"));
            Assert.That(result.SelectionStart, Is.EqualTo(3));
            Assert.That(result.SelectionEnd, Is.EqualTo(3));
        });
    }

    [Test]
    public void NormalizeWithSelection_maps_both_edges_of_a_selected_range_after_filtering()
    {
        var result = TextFieldValuePipeline.NormalizeWithSelection(
            "A1\u06F9B2",
            selectionStart: 2,
            selectionEnd: 4,
            digitOnly: true,
            asciiDigits: true,
            arabicToPersianConversion: false);

        Assert.Multiple(() =>
        {
            Assert.That(result.Value, Is.EqualTo("192"));
            Assert.That(result.SelectionStart, Is.EqualTo(1));
            Assert.That(result.SelectionEnd, Is.EqualTo(2));
        });
    }

    [Test]
    public void NormalizeWithSelection_preserves_offsets_when_transforms_only_replace_characters()
    {
        var result = TextFieldValuePipeline.NormalizeWithSelection(
            "A\u0643B\u064A",
            selectionStart: 2,
            selectionEnd: 4,
            digitOnly: false,
            asciiDigits: false,
            arabicToPersianConversion: true);

        Assert.Multiple(() =>
        {
            Assert.That(result.Value, Is.EqualTo("A\u06A9B\u06CC"));
            Assert.That(result.SelectionStart, Is.EqualTo(2));
            Assert.That(result.SelectionEnd, Is.EqualTo(4));
        });
    }

    [Test]
    public void NormalizeWithSelection_clamps_offsets_to_the_source_bounds()
    {
        var result = TextFieldValuePipeline.NormalizeWithSelection(
            "A1B2",
            selectionStart: -5,
            selectionEnd: 99,
            digitOnly: true,
            asciiDigits: false,
            arabicToPersianConversion: false);

        Assert.Multiple(() =>
        {
            Assert.That(result.Value, Is.EqualTo("12"));
            Assert.That(result.SelectionStart, Is.Zero);
            Assert.That(result.SelectionEnd, Is.EqualTo(2));
        });
    }

    [Test]
    public void NormalizeWithSelection_preserves_missing_offsets_and_handles_null_value()
    {
        var result = TextFieldValuePipeline.NormalizeWithSelection(
            null,
            selectionStart: null,
            selectionEnd: 0,
            digitOnly: true,
            asciiDigits: true,
            arabicToPersianConversion: true);

        Assert.Multiple(() =>
        {
            Assert.That(result.Value, Is.Null);
            Assert.That(result.SelectionStart, Is.Null);
            Assert.That(result.SelectionEnd, Is.Zero);
        });
    }
}