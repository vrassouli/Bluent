using System.Diagnostics.CodeAnalysis;
using System.Globalization;
using Microsoft.AspNetCore.Components;

namespace Bluent.UI.Components;

public partial class OtpField
{
    [Parameter] public int Length { get; set; } = 4;
    [Parameter] public bool Password { get; set; }
    private string[] Digits =>
        (CurrentValue ?? string.Empty).Where(char.IsDigit)
        .Take(Math.Max(1, Length))
        .Select(c => c.ToString(CultureInfo.InvariantCulture))
        .Concat(Enumerable.Repeat(string.Empty, Math.Max(0, Length - (CurrentValue?.Length ?? 0))))
        .Take(Math.Max(1, Length))
        .ToArray();
    protected override IEnumerable<string> GetClasses()
    {
        yield return "bui-otp-field";
    }

    protected override bool TryParseValueFromString(string? value, [MaybeNullWhen(false)] out string? result,
        [NotNullWhen(false)] out string? validationErrorMessage)
    {
        result = value;
        validationErrorMessage = null;
        return true;
    }
}