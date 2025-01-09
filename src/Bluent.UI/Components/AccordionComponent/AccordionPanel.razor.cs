using Microsoft.AspNetCore.Components;

namespace Bluent.UI.Components;

public partial class AccordionPanel
{
    [Parameter] public RenderFragment? ChildContent { get; set; }
    [Parameter] public RenderFragment? HeaderAction { get; set; }
    [Parameter, EditorRequired] public string Header { get; set; } = default!;
    [Parameter] public string HeaderIcon { get; set; } = default!;
    [Parameter] public string PanelClasses { get; set; } = default!;
    [Parameter] public bool DeferredLoading { get; set; } = default!;
    [Parameter] public bool Expanded { get; set; }
    [Parameter] public EventCallback<bool> ExpandedChanged { get; set; }
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

        if (Expanded)
            yield return "expanded";
    }

    public void Toggle()
    {
        if (Expanded)
            Collapse();
        else
            Expand();
    }

    public void Collapse()
    {
        if (!Expanded)
            return;

        Accordion.OnPanelCollapsing(this);

        Expanded = false;
        InvokeAsync(() => ExpandedChanged.InvokeAsync(Expanded));

        StateHasChanged();
    }

    public void Expand()
    {
        if (Expanded)
            return;
        
        Accordion.OnPanelExpanding(this);

        Expanded = true;
        InvokeAsync(() => ExpandedChanged.InvokeAsync(Expanded));
    
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
