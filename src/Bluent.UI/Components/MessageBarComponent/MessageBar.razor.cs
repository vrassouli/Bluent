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
    [Parameter] public string? IconClass { get; set; }

    protected override Task OnParametersSetAsync()
    {
        if (_dismissed != Dismissed)
        {
            _dismissed = true;
        }
        
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

    private string GetIconClass()
    {
        if (!string.IsNullOrEmpty(IconClass))
            return IconClass;
        
        return Type switch
        {
            MessageBarType.Warning => "icon-ic_fluent_warning_20_filled",
            MessageBarType.Danger => "icon-ic_fluent_error_circle_20_filled",
            MessageBarType.Success => "icon-ic_fluent_checkmark_circle_20_filled",
            MessageBarType.Information => "icon-ic_fluent_info_20_filled",
            _ => "icon-ic_fluent_alert_20_filled"
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
