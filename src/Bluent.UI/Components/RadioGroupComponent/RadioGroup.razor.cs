using Microsoft.AspNetCore.Components;
using Microsoft.AspNetCore.Components.Forms;
using System.Diagnostics.CodeAnalysis;
using System.Linq.Expressions;

namespace Bluent.UI.Components;

public partial class RadioGroup<TValue> : IDisposable
{
    private TValue? _value;
    private bool _hasExplicitValueExpression;
    private EditContext? _subscribedEditContext;

    [Parameter] public RenderFragment? ChildContent { get; set; }
    [Parameter] public string? Label { get; set; }
    [Parameter] public LabelPosition ItemsLabelPosition { get; set; } = LabelPosition.After;
    [Parameter] public Orientation Orientation { get; set; } = Orientation.Horizontal;

    internal event EventHandler? OnValueChanged;

    internal string RadioGroupName
    {
        get
        {
            var explicitName = AdditionalAttributes?
                .FirstOrDefault(attribute => string.Equals(attribute.Key, "name", StringComparison.OrdinalIgnoreCase))
                .Value?.ToString();

            if (!string.IsNullOrWhiteSpace(explicitName))
                return explicitName;

            if (_hasExplicitValueExpression && !string.IsNullOrWhiteSpace(NameAttributeValue))
                return NameAttributeValue;

            return Id;
        }
    }

    internal bool HasValidationErrors =>
        EditContext?.GetValidationMessages(FieldIdentifier).Any() == true;

    public override Task SetParametersAsync(ParameterView parameters)
    {
        _hasExplicitValueExpression =
            parameters.TryGetValue<Expression<Func<TValue?>>>(nameof(ValueExpression), out var expression) &&
            expression is not null;

        return base.SetParametersAsync(parameters);
    }

    protected override void OnParametersSet()
    {
        SynchronizeEditContextSubscription();

        if (!EqualityComparer<TValue?>.Default.Equals(_value, Value))
        {
            _value = Value;
            OnValueChanged?.Invoke(this, EventArgs.Empty);
        }

        base.OnParametersSet();
    }

    private void SynchronizeEditContextSubscription()
    {
        if (ReferenceEquals(_subscribedEditContext, EditContext))
            return;

        if (_subscribedEditContext is not null)
            _subscribedEditContext.OnValidationStateChanged -= HandleValidationStateChanged;

        _subscribedEditContext = EditContext;

        if (_subscribedEditContext is not null)
            _subscribedEditContext.OnValidationStateChanged += HandleValidationStateChanged;
    }

    private void HandleValidationStateChanged(object? sender, ValidationStateChangedEventArgs args)
    {
        OnValueChanged?.Invoke(this, EventArgs.Empty);
    }

    public void Dispose()
    {
        if (_subscribedEditContext is not null)
        {
            _subscribedEditContext.OnValidationStateChanged -= HandleValidationStateChanged;
            _subscribedEditContext = null;
        }
    }
    protected override IEnumerable<string> GetClasses()
    {
        yield return "bui-radio-group";

        if (Orientation == Orientation.Vertical)
            yield return "vertical";
    }

    protected Dictionary<string, object>? GetGroupAdditionalAttributes()
    {
        if (AdditionalAttributes is null)
            return null;

        var attributes = new Dictionary<string, object>(StringComparer.OrdinalIgnoreCase);

        foreach (var attribute in AdditionalAttributes)
        {
            if (attribute.Key.Equals("class", StringComparison.OrdinalIgnoreCase) ||
                attribute.Key.Equals("style", StringComparison.OrdinalIgnoreCase) ||
                attribute.Key.Equals("id", StringComparison.OrdinalIgnoreCase) ||
                attribute.Key.Equals("name", StringComparison.OrdinalIgnoreCase))
            {
                continue;
            }

            attributes[attribute.Key] = attribute.Value;
        }

        return attributes.Count == 0 ? null : attributes;
    }

    protected override bool TryParseValueFromString(
        string? value,
        [MaybeNullWhen(false)] out TValue? result,
        [NotNullWhen(false)] out string? validationErrorMessage)
    {
        result = Value;
        validationErrorMessage = null;

        return true;
    }

    internal void SetValue(TValue value)
    {
        if (EqualityComparer<TValue?>.Default.Equals(CurrentValue, value))
            return;

        CurrentValue = value;
        OnValueChanged?.Invoke(this, EventArgs.Empty);
    }
}
