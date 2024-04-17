using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Bluent.UI.Components.DialogComponent;

internal class DialogContentConfiguration
{
    public DialogContentConfiguration(bool showCloseButton, List<DialogAction> actions)
    {
        ShowCloseButton = showCloseButton;
        Actions = actions;
    }

    public bool ShowCloseButton { get; }
    public List<DialogAction> Actions { get; }
}
