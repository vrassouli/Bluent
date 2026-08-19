using Humanizer;
using Microsoft.AspNetCore.Components;

namespace Bluent.UI.Components;

public partial class MessageBar
{
    private bool _dismissed;
    
    [Parameter] public MessageBarType Type { get; set; } = MessageBarType.Default;
    [Parameter] public bool Dismissed { get; set; }
    [Parameter] public EventCallback<bool> DismissedChanged { get; set; }
    [Parameter] public bool Dismissable { get; set; }
    [Parameter] public RenderFragment? ChildContent { get; set; }
    [Parameter] public RenderFragment? Actions { get; set; }
    [Parameter] public bool Multiline { get; set; }
    [Parameter] public EventCallback OnDismiss { get; set; }
    [Parameter] public IconDefinition? Icon { get; set; }

    protected override Task OnParametersSetAsync()
    {
        if (_dismissed != Dismissed)
            _dismissed = true;
        
        return base.OnParametersSetAsync();
    }

    public override IEnumerable<string> GetClasses()
    {
        yield return "bui-message-bar";

        if (Multiline)
            yield return "multiline";

        if (Type != MessageBarType.Default)
            yield return Type.ToString().Kebaberize();
    }

    private IconDefinition GetIcon()
    {
        if (Icon.HasValue)
            return Icon.Value;
        
        return Type switch
        {
            MessageBarType.Warning => FluentIcons.Warning,
            MessageBarType.Danger => FluentIcons.ErrorCircle,
            MessageBarType.Success => FluentIcons.CheckmarkCircle,
            MessageBarType.Information => FluentIcons.Info,
            _ => FluentIcons.Alert
        };
    }

    private Task HandleDismiss()
    {
        if (OnDismiss.HasDelegate)
            return OnDismiss.InvokeAsync(null);

        if (!_dismissed)
        {
            _dismissed = true;
            return DismissedChanged.InvokeAsync(_dismissed);
        }

        return Task.CompletedTask;
    }
}
