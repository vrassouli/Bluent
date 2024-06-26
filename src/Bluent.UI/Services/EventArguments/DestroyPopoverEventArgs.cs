﻿namespace Bluent.UI.Services.EventArguments;

internal class DestroyPopoverEventArgs : EventArgs
{
    public DestroyPopoverEventArgs(string triggerId)
    {
        TriggerId = triggerId;
    }

    public string TriggerId { get; }
}
