using Bluent.Core;
using Bluent.UI.Extensions;
using Bluent.UI.Services.Abstractions;
using Microsoft.AspNetCore.Components;

namespace Bluent.UI.Components;

public partial class Popover : IDisposable
{
    private bool _triggerAlreadySet;
    private PopoverSettings? _settings;

    [Parameter, EditorRequired] public RenderFragment Trigger { get; set; } = default!;
    [Parameter, EditorRequired] public RenderFragment Surface { get; set; } = default!;
    [Parameter] public Placement Placement { get; set; } = Placement.Top;
    [Parameter] public int Offset { get; set; } = 6;
    [Parameter] public int Padding { get; set; } = 5;
    [Parameter] public bool DisplayArrow { get; set; } = true;
    [Parameter] public bool KeepSurface { get; set; }
    [Parameter] public string? TriggerEvents { get; set; } = "click";
    [Parameter] public string? HideEvents { get; set; }
    [Parameter] public bool SameWidth { get; set; }
    [Parameter] public PopoverAppearance Appearance { get; set; } = PopoverAppearance.Default;
    [Inject] private IPopoverService PopoverService { get; set; } = default!;

    protected override void OnInitialized()
    {
        if (Trigger == null)
            throw new InvalidOperationException($"'{nameof(Popover)}' component requires '{nameof(Trigger)}' content property.");

        if (Surface == null)
            throw new InvalidOperationException($"'{nameof(Popover)}' component requires '{nameof(Surface)}' content property.");

        if (PopoverService == null)
            throw new InvalidOperationException($"Required '{nameof(ITooltipService)}' service is not found. You should register '{nameof(Bluent)}' services using 'services.{nameof(ServiceCollectionExtensions.AddBluentUI)}' extension method.");

        base.OnInitialized();
    }

    public void SetTrigger(IBluentComponent triggerComponent)
    {
        if (_triggerAlreadySet)
            return;

        _settings = new PopoverSettings(triggerComponent.Id, Placement, Offset, Padding)
        {
            TriggerEvents = TriggerEvents?.Split([',', ' ', ';'], StringSplitOptions.TrimEntries),
            HideEvents = HideEvents?.Split([',', ' ', ';'], StringSplitOptions.TrimEntries),
            SameWidth = SameWidth
        };

        PopoverService.SetTrigger(GetSurfaceFragment(), new PopoverConfiguration(_settings, DisplayArrow, Appearance, KeepSurface));

        _triggerAlreadySet = true;
    }

    public void Show()
    {
        if (_settings is null)
            throw new InvalidOperationException("Popover trigger is not set.");

        PopoverService.Show(_settings.TriggerId);
    }

    private RenderFragment GetSurfaceFragment()
    {
        return builder =>
        {
            builder.OpenComponent<CascadingValue<Popover>>(0);
            builder.AddComponentParameter(1, "IsFixed", true);
            builder.AddComponentParameter(2, "Value", this);
            builder.AddComponentParameter(3, "ChildContent", Surface);
            builder.CloseComponent();
        };
    }

    public void Close()
    {
        if (_settings is not null)
            PopoverService.Close(_settings.TriggerId);
    }

    public void RefreshSurface(bool updatePosition = false)
    {
        if (_settings is not null)
        {
            PopoverService.RefreshSurface(_settings.TriggerId);

            if (updatePosition)
                PopoverService.Show(_settings.TriggerId);
        }
    }

    public void Dispose()
    {
        if (_settings != null)
            PopoverService.Destroy(_settings.TriggerId);
    }
}
