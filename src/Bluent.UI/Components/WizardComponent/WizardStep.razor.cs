using Microsoft.AspNetCore.Components;

namespace Bluent.UI.Components;

public partial class WizardStep
{
    [Parameter] public string? Title { get; set; } = default!;
    [Parameter] public RenderFragment? ChildContent { get; set; } = default!;
    [Parameter] public bool DeferredLoading { get; set; }
    [CascadingParameter] public Wizard Wizard { get; set; } = default!;

    protected override void OnInitialized()
    {
        if (Wizard is null)
        {
            throw new InvalidOperationException($"'{nameof(WizardStep)}' component should be nested inside of a '{nameof(Components.Wizard)}' component.");
        }

        Wizard.Add(this);

        base.OnInitialized();
    }

    public override void Dispose()
    {
        Wizard.Remove(this);

        base.Dispose();
    }

    public override IEnumerable<string> GetClasses()
    {
        yield return "step";
        if (Wizard.IsCurrent(this))
            yield return "current";
    }
}
