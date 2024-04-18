using Bluent.UI.Components.DialogComponent;

namespace Bluent.UI.Components;

public class DialogConfigurator
{
    private bool _modal = true;
    private DialogSize _size;
    private bool _showCloseButton = true;
    private List<DialogAction> _actions = new();

    public DialogConfigurator SetModal(bool isModal = true)
    {
        _modal = isModal;

        return this;
    }

    public DialogConfigurator SetSize(DialogSize size = DialogSize.Medium)
    {
        _size = size;

        return this;
    }

    public DialogConfigurator SetCloseButton(bool show = true)
    {
        _showCloseButton = show;

        return this;
    }

    public DialogConfigurator AddAction(string text, object? result = null, bool primary = false, string? formToSumbit = null, Action<Dialog, object?>? callback = null)
    {
        _actions.Add(new DialogAction(text, result, primary, formToSumbit, callback));

        return this;
    }

    internal DialogConfiguration DialogConfiguration => new DialogConfiguration(_modal, _size);
    internal bool ShowCloseButton => _showCloseButton;
    internal List<DialogAction> Actions => _actions;
}
