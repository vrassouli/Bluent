using Microsoft.AspNetCore.Components;

namespace Bluent.UI.Components;

public partial class Accordion
{
    private List<AccordionPanel> _panels = new();

    [Parameter] public RenderFragment? ChildContent { get; set; }
    [Parameter] public AccordionHeaderAction HeaderAction { get; set; } = AccordionHeaderAction.Expand;
    [Parameter] public bool Multiple { get; set; }

    public override IEnumerable<string> GetClasses()
    {
        yield return "bui-accordion";
    }

    internal void Add(AccordionPanel panel)
    {
        _panels.Add(panel);
    }

    internal void Remove(AccordionPanel panel)
    {
        _panels.Remove(panel);
    }

    internal void OnPanelCollapsing(AccordionPanel panel)
    {
    }

    internal void OnPanelExpanding(AccordionPanel panel)
    {
        if (!Multiple)
            _panels.FirstOrDefault(x => x.Expanded)?.Collapse();
    }
}
