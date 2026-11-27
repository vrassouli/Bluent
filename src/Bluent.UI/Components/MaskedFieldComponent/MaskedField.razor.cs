using Bluent.UI.Common.Regex;
using Microsoft.AspNetCore.Components;
using Microsoft.AspNetCore.Components.Rendering;
using Microsoft.AspNetCore.Components.Web;
using System.Diagnostics.CodeAnalysis;
using System.Text.RegularExpressions;
using Bluent.UI.Extensions;

namespace Bluent.UI.Components;

public partial class MaskedField
{
    private string? _mask;
    private List<LexPath> _LexPaths = new();
    private string? _lastValidInput;
    private string? _value;

    [Parameter, EditorRequired] public string Mask { get; set; } = default!;
    [Parameter] public bool AsciiDigits { get; set; }
    [Parameter] public bool ArabicToPersianConversion { get; set; }
    [Parameter] public string InputEventName { get; set; } = "oninput";

    private string? UserInput { get; set; }

    protected override void OnParametersSet()
    {
        if (InputEventName is not ("oninput" or "onchange"))
            throw new InvalidOperationException($"{nameof(InputEventName)} supports only 'oninput' and 'onchange'.");

        if (_mask != Mask)
        {
            if (_mask != null)
                SetUserInput(null);

            _mask = Mask;
            GenerateMaskSamples();
        }

        if (_value != Value)
        {
            _value = Value;
            SetUserInput(Value);
        }

        base.OnParametersSet();
    }

    protected override bool TryParseValueFromString(string? value, out string? result, [NotNullWhen(false)] out string? validationErrorMessage)
    {
        validationErrorMessage = default;
        result = value;
        return true;
    }

    private RenderFragment RenderInput() => builder =>
    {
        builder.OpenElement(0, "input");
        builder.AddMultipleAttributes(1, GetInputAdditionalAttributes());
        builder.AddAttribute(2, "id", GetInputId());
        builder.AddAttribute(3, "type", "text");
        builder.AddAttribute(4, "name", NameAttributeValue);
        builder.AddAttribute(5, "value", UserInput);
        builder.AddAttribute(6, InputEventName, EventCallback.Factory.Create<ChangeEventArgs>(this, OnUserInputChanged));
        builder.AddEventPreventDefaultAttribute(7, InputEventName, true);
        builder.AddEventStopPropagationAttribute(8, InputEventName, true);
        builder.AddAttribute(9, "onkeyup", EventCallback.Factory.Create<KeyboardEventArgs>(this, OnKeyUp));
        builder.AddElementReferenceCapture(10, element => Element = element);
        builder.CloseElement();
    };

    private void OnUserInputChanged(ChangeEventArgs args)
    {
        var value = args.Value?.ToString();
        if (AsciiDigits)
            value = value?.ToAsciiDigits();
        if (ArabicToPersianConversion)
            value = value?.ToPersianChars();

        SetUserInput(value);
    }

    private void SetUserInput(string? value)
    {
        UserInput = value?.ToString();

        if (IsValid())
        {
            AppendLiterals();

            if (CurrentValueAsString != UserInput)
                CurrentValueAsString = UserInput;

            _lastValidInput = UserInput;
        }
    }

    private void OnKeyUp(KeyboardEventArgs args)
    {
        if (UserInput != _lastValidInput && !IsValid())
            UserInput = _lastValidInput;
    }

    private void GenerateMaskSamples() => _LexPaths = RegexLexer.ToPaths(Mask);

    private bool IsValid()
    {
        foreach (var path in _LexPaths)
        {
            if (IsValid(path))
                return true;
        }

        return false;
    }

    private bool IsValid(LexPath path)
    {
        var input = UserInput;
        if (input is null)
            return true;

        var sample = path.GetSample();
        if (input.Length > sample.Length)
            return false;

        var toTest = input + sample.Remove(0, input.Length);
        return Regex.IsMatch(toTest, Mask);
    }

    private char? GetLiteralAt(int position)
    {
        if (Mask.StartsWith('^'))
            position++;

        var literals = _LexPaths
            .Where(path => IsValid(path))
            .Select(path => path.GetLitteralAt(position))
            .ToList();

        if (literals.Distinct().Count() == 1)
            return literals[0];

        return null;
    }

    private void AppendLiterals()
    {
        do
        {
            var nextLiteral = GetLiteralAt(UserInput?.Length ?? 0);
            if (nextLiteral is null)
                break;

            UserInput += nextLiteral;
        } while (true);
    }
}
