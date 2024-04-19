﻿using Bluent.UI.Components.OverflowComponent;
using Microsoft.AspNetCore.Components;

namespace Bluent.UI.Components;

public abstract class OverflowItemComponentBase : BluentComponentBase, IOverflowItem
{
    [CascadingParameter] public Overflow Overflow { get; set; } = default!;

    protected override void OnInitialized()
    {
        if (Overflow is null)
            throw new InvalidOperationException($"'{this.GetType().Name}' component should be nested inside a '{nameof(Components.Overflow)}' component.");

        Overflow.Add(this);

        base.OnInitialized();
    }

    public override void Dispose()
    {
        Overflow.Remove(this);

        base.Dispose();
    }
}