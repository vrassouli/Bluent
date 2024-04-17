using Bluent.UI.Components.DialogComponent;

namespace Bluent.UI.Services.EventArguments;

internal class ShowDialogEventArgs : EventArgs
{
    public ShowDialogEventArgs(DialogContext context)
    {
        Context = context;
    }

    public DialogContext Context { get; }
}
