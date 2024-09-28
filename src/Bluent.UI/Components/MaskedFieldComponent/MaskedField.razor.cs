using Bluent.UI.Common.Regex;
using Microsoft.AspNetCore.Components;
using Microsoft.AspNetCore.Components.Web;
using System.Diagnostics.CodeAnalysis;
using System.Text.RegularExpressions;

namespace Bluent.UI.Components;

public partial class MaskedField
{
    private string? _mask;
    private List<LexPath> _LexPaths = new();
    private string? _lastValidInput;
    private string? _value;
    [Parameter, EditorRequired] public string Mask { get; set; } = default!;

    private string? UserInput { get; set; }

    protected override void OnParametersSet()
    {
        if (_mask != Mask)
        {
            if (_mask != null) // Don't set if this is the first-time
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

    private void OnUserInputChanged(ChangeEventArgs args)
    {
        SetUserInput(args.Value?.ToString());
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
        {
            UserInput = _lastValidInput;
        }
    }

    private void GenerateMaskSamples()
    {
        _LexPaths = RegexLexer.ToPaths(Mask);
    }

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
