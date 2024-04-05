using Microsoft.AspNetCore.Components;

namespace Bluent.UI.Components;

public partial class AccordionPanel
{
    [Parameter] public RenderFragment? ChildContent { get; set; }
    [Parameter, EditorRequired] public string Header { get; set; } = default!;
    [Parameter] public string HeaderIcon { get; set; } = default!;
    [Parameter] public AccordionPanelState State { get; set; } = AccordionPanelState.Collapsed;
    [Parameter] public EventCallback<AccordionPanelState> StateChanged { get; set; }
    [CascadingParameter] public Accordion Accordion { get; set; } = default!;

    protected override void OnInitialized()
    {
        if (Accordion is null)
            throw new InvalidOperationException($"'{nameof(AccordionPanel)}' component should be nested inside a '{nameof(Components.Accordion)}' component.");

        Accordion.Add(this);

        base.OnInitialized();
    }

    public override void Dispose()
    {
        Accordion.Remove(this);

        base.Dispose();
    }

    public override IEnumerable<string> GetClasses()
    {
        yield return "accordion-panel";

        if (State == AccordionPanelState.Expanded)
            yield return "expanded";
    }

    public void Toggle()
    {
        if (State == AccordionPanelState.Collapsed)
            Expand();
        else
            Collapse();
    }

    public void Collapse()
    {
        if (State == AccordionPanelState.Collapsed)
            return;

        Accordion.OnPanelCollapsing(this);

        State = AccordionPanelState.Collapsed;
        InvokeAsync(() => StateChanged.InvokeAsync(State));

        StateHasChanged();
    }

    public void Expand()
    {
        if (State == AccordionPanelState.Expanded)
            return;
        
        Accordion.OnPanelExpanding(this);

        State = AccordionPanelState.Expanded;
        InvokeAsync(() => StateChanged.InvokeAsync(State));
    
        StateHasChanged();
    }

    private void ClickHandler()
    {
        if (Accordion.HeaderAction == AccordionHeaderAction.Expand)
            Expand();
        else
            Toggle();
    }
}
