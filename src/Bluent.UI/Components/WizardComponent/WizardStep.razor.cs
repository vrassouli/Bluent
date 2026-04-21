using Microsoft.AspNetCore.Components;

namespace Bluent.UI.Components;

public partial class WizardStep
{
    private string? _title;
    [Parameter] public string? Title { get; set; }
    [Parameter] public RenderFragment? ChildContent { get; set; }
    [Parameter] public bool DeferredLoading { get; set; }
    [Parameter] public int? Index { get; set; }
    [Parameter] public EventCallback<int?> IndexChanged { get; set; }
    [CascadingParameter] public Wizard Wizard { get; set; } = default!;

    protected override void OnInitialized()
    {
        if (Wizard is null)
        {
            throw new InvalidOperationException($"'{nameof(WizardStep)}' component should be nested inside of a '{nameof(Components.Wizard)}' component.");
        }
        base.OnInitialized();
    }

    protected override async Task OnInitializedAsync()
    {
        var index = await Wizard.Add(this, Index);
        if (index != Index)
            await IndexChanged.InvokeAsync(index);
        
        await base.OnInitializedAsync();
    }

    protected override void OnParametersSet()
    {
        if (_title != Title)
        {
            _title = Title;
            Wizard.Update();
        }
        base.OnParametersSet();
    }
    
    internal Task UpdateIndex(int index) => IndexChanged.InvokeAsync(index);

    public override ValueTask DisposeAsync()
    {
        Wizard.Remove(this);

        return base.DisposeAsync();
    }

    public override IEnumerable<string> GetClasses()
    {
        yield return "step";
        if (Wizard.IsCurrent(this))
            yield return "current";
    }
}
