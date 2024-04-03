﻿using Bluent.UI.Extensions;
using Bluent.UI.Services.Abstractions;
using Humanizer;
using Microsoft.AspNetCore.Components;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Bluent.UI.Components;

public partial class Popover
{
    private PopoverSettings _settings;

    [Parameter, EditorRequired] public RenderFragment Trigger { get; set; } = default!;
    [Parameter, EditorRequired] public RenderFragment Surface { get; set; } = default!;
    [Parameter] public Placement Placement { get; set; } = Placement.Top;
    [Parameter] public bool DisplayArrow { get; set; } = true;
    [Parameter] public string? TriggerEvents { get; set; } = "click";
    [Parameter] public string? HideEvents { get; set; }
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

    public override IEnumerable<string> GetClasses()
    {
        yield return "bui-popover";
    }

    //protected override void OnAfterRender(bool firstRender)
    //{
    //    if (firstRender)
    //        PopoverService.Set(Id, Surface, Placement, DisplayArrow);

    //    base.OnAfterRender(firstRender);
    //}

    public void SetTrigger(BluentComponentBase triggerComponent)
    {
        _settings = new PopoverSettings(triggerComponent.Id, Placement)
        {
            TriggerEvents = TriggerEvents?.Split(new char[] { ',', ' ', ';' }, StringSplitOptions.TrimEntries),
            HideEvents = HideEvents?.Split(new char[] { ',', ' ', ';' }, StringSplitOptions.TrimEntries),
        };

        PopoverService.SetTrigger(new PopoverConfiguration(_settings, Surface, DisplayArrow, Appearance));
    }

    public override void Dispose()
    {
        PopoverService.Destroy(_settings.TriggerId);
        base.Dispose();
    }
}
