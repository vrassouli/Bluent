using Bluent.UI.Components;

namespace RegexSampleGeneratorTest;

public class TextFieldValuePipelineTests
{
    [TestCase(false, false, false, "A١۲۳٤-5 ك ي", "A١۲۳٤-5 ك ي")]
    [TestCase(true,  false, false, "A١۲۳٤-5 ك ي", "١۲۳٤5")]
    [TestCase(false, true,  false, "A١۲۳٤-5 ك ي", "A1234-5 ك ي")]
    [TestCase(false, false, true,  "A١۲۳٤-5 ك ي", "A١۲۳٤-5 ک ی")]
    [TestCase(true,  true,  false, "A١۲۳٤-5 ك ي", "12345")]
    [TestCase(true,  false, true,  "A١۲۳٤-5 ك ي", "١۲۳٤5")]
    [TestCase(false, true,  true,  "A١۲۳٤-5 ك ي", "A1234-5 ک ی")]
    [TestCase(true,  true,  true,  "A١۲۳٤-5 ك ي", "12345")]
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
}
