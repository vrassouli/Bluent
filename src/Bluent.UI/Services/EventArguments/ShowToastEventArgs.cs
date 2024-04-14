using Bluent.UI.Components;

namespace Bluent.UI.Services.EventArguments;

internal class ShowToastEventArgs : EventArgs
{

    public ShowToastEventArgs(ToastContext context)
    {
        Context = context;
    }

    public ToastContext Context { get; }
}
