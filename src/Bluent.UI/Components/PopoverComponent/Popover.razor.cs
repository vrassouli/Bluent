using Bluent.Core;
using Bluent.UI.Extensions;
using Bluent.UI.Services.Abstractions;
using Microsoft.AspNetCore.Components;

namespace Bluent.UI.Components;

public partial class Popover : IDisposable
{
    private bool _triggerAlreadySet;
    private PopoverSettings? _settings;
    private PopoverConfiguration? _configuration;
    private RenderFragment? _registeredSurface;

    [Parameter, EditorRequired] public RenderFragment Trigger { get; set; } = default!;
    [Parameter, EditorRequired] public RenderFragment Surface { get; set; } = default!;
    [Parameter] public Placement Placement { get; set; } = Placement.Top;
    [Parameter] public int Offset { get; set; } = 6;
    [Parameter] public int Padding { get; set; } = 5;
    [Parameter] public bool DisplayArrow { get; set; } = true;
    [Parameter] public bool KeepSurface { get; set; }
    /// <summary>Experimental #418 opt-in button-triggered aria-expanded/aria-controls support.</summary>
    [Parameter] public bool AccessibleTriggerState { get; set; }
    /// <summary>Explicit ARIA role for the detached surface referenced by the trigger's aria-controls.</summary>
    [Parameter] public string? SurfaceRole { get; set; }
    /// <summary>Author-provided accessible name for the detached surface. Mutually exclusive with SurfaceAriaLabelledBy.</summary>
    [Parameter] public string? SurfaceAriaLabel { get; set; }
    /// <summary>One or more element IDs that label the detached surface. Mutually exclusive with SurfaceAriaLabel.</summary>
    [Parameter] public string? SurfaceAriaLabelledBy { get; set; }
    [Parameter] public string? TriggerEvents { get; set; } = "click";
    [Parameter] public string? HideEvents { get; set; }
    [Parameter] public bool SameWidth { get; set; }
    [Parameter] public PopoverAppearance Appearance { get; set; } = PopoverAppearance.Default;
    [Inject] private IPopoverService PopoverService { get; set; } = default!;
    [CascadingParameter] public PortalThemeScope? ThemeScope { get; set; }

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

        PopoverSurfaceAccessibilityContract.Validate(SurfaceRole, SurfaceAriaLabel, SurfaceAriaLabelledBy);

        _settings = new PopoverSettings(triggerComponent.Id, Placement, Offset, Padding)
        {
            TriggerEvents = TriggerEvents?.Split([',', ' ', ';'], StringSplitOptions.TrimEntries),
            HideEvents = HideEvents?.Split([',', ' ', ';'], StringSplitOptions.TrimEntries),
            SameWidth = SameWidth,
            AccessibleTriggerState = AccessibleTriggerState
        };

        _configuration = new PopoverConfiguration(_settings, DisplayArrow, Appearance, KeepSurface, ThemeScope)
        {
            SurfaceRole = SurfaceRole,
            SurfaceAriaLabel = SurfaceAriaLabel,
            SurfaceAriaLabelledBy = SurfaceAriaLabelledBy
        };
        _registeredSurface = Surface;
        PopoverService.SetTrigger(GetSurfaceFragment(), _configuration);

        _triggerAlreadySet = true;
    }

    protected override void OnParametersSet()
    {
        base.OnParametersSet();
        PopoverSurfaceAccessibilityContract.Validate(SurfaceRole, SurfaceAriaLabel, SurfaceAriaLabelledBy);

        if (_configuration is null)
            return;

        // The detached surface is a live view of its registered owner. Keep
        // DOM-only role/name values in Blazor configuration (never JS settings)
        // and refresh the exact surface when its consumer parameters change.
        var changed = !Equals(_configuration.ThemeScope, ThemeScope)
            || !string.Equals(_configuration.SurfaceRole, SurfaceRole, StringComparison.Ordinal)
            || !string.Equals(_configuration.SurfaceAriaLabel, SurfaceAriaLabel, StringComparison.Ordinal)
            || !string.Equals(_configuration.SurfaceAriaLabelledBy, SurfaceAriaLabelledBy, StringComparison.Ordinal)
            || !ReferenceEquals(_registeredSurface, Surface);

        if (!changed)
            return;

        _configuration.ThemeScope = ThemeScope;
        _configuration.SurfaceRole = SurfaceRole;
        _configuration.SurfaceAriaLabel = SurfaceAriaLabel;
        _configuration.SurfaceAriaLabelledBy = SurfaceAriaLabelledBy;
        _registeredSurface = Surface;
        PopoverService.RefreshSurface(_configuration.Settings.TriggerId);
    }
    public void Show()
    {
        if (_settings is null)
            throw new InvalidOperationException("Popover trigger is not set.");

        PopoverService.Show(_settings.TriggerId);
    }

    internal Task ShowAsync()
    {
        if (_settings is null)
            throw new InvalidOperationException("Popover trigger is not set.");

        if (PopoverService is Bluent.UI.Services.PopoverService service)
            return service.ShowAsync(_settings.TriggerId);

        PopoverService.Show(_settings.TriggerId);
        return Task.CompletedTask;
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

    internal Task CloseAsync() => CloseAsync(restoreFocus: false);

    internal Task CloseAsync(bool restoreFocus)
    {
        if (_settings is null)
            return Task.CompletedTask;

        if (PopoverService is Bluent.UI.Services.PopoverService service)
            return service.CloseAsync(_settings.TriggerId, restoreFocus);

        PopoverService.Close(_settings.TriggerId);
        return Task.CompletedTask;
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
