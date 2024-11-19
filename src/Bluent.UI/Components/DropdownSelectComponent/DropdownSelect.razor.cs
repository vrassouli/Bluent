using Microsoft.AspNetCore.Components;
using Microsoft.Extensions.Localization;

namespace Bluent.UI.Components;

public partial class DropdownSelect<TValue>
{
    private Popover? _popover;

    [Parameter] public Placement DropdownPlacement { get; set; } = Placement.BottomStart;
    [Parameter] public bool CanClear { get; set; } = true;
    [Parameter] public string EmptyMessage { get; set; } = default!;
    [Parameter, EditorRequired] public RenderFragment? Dropdown { get; set; }
    [Parameter, EditorRequired] public IEnumerable<DropdownOption<TValue>> Options { get; set; } = Enumerable.Empty<DropdownOption<TValue>>();
    [Parameter] public EventCallback<TValue?> ClearOption { get; set; }
    [Inject] private IStringLocalizer<DropdownSelectComponent.Resources.DropdownSelect> Localizer { get; set; } = default!;

    protected override void OnParametersSet()
    {
        if (string.IsNullOrEmpty(EmptyMessage))
            EmptyMessage = Localizer["Select..."];

        base.OnParametersSet();
    }

    protected override void OnAfterRender(bool firstRender)
    {
        if (firstRender && _popover != null)
        {
            _popover.SetTrigger(this);
        }

        base.OnAfterRender(firstRender);
    }

    public override IEnumerable<string> GetClasses()
    {
        yield return "bui-dropdown-select";
    }

    public void Close()
    {
        _popover?.Close();
    }

    public void Refresh()
    {
        _popover?.RefreshSurface();
    }

    private Task OnClearOption(TValue? value)
    {
        return ClearOption.InvokeAsync(value);
    }
}
