using Bluent.UI.Components.DialogComponent;

namespace Bluent.UI.Components;

public class DialogConfigurator
{
    private bool _modal = true;
    private DialogSize _size = DialogSize.Medium;
    private PortalThemeScope? _themeScope;
    private bool _showCloseButton = true;
    private List<DialogAction> _actions = new();

    public DialogConfigurator SetModal(bool isModal)
    {
        _modal = isModal;

        return this;
    }

    public DialogConfigurator SetSize(DialogSize size)
    {
        _size = size;

        return this;
    }

    /// <summary>Opt into the experimental #418 detached-portal theme snapshot.</summary>
    public DialogConfigurator SetThemeScope(PortalThemeScope? themeScope)
    {
        _themeScope = themeScope;
        return this;
    }
    public DialogConfigurator SetCloseButton(bool show)
    {
        _showCloseButton = show;

        return this;
    }

    public DialogConfigurator AddAction(string text, object? result = null, bool primary = false, string? formToSumbit = null, Action<Dialog, object?>? callback = null)
    {
        _actions.Add(new DialogAction(text, result, primary, formToSumbit, callback));

        return this;
    }

    internal DialogConfiguration Configuration => new DialogConfiguration(_modal, _size) { ThemeScope = _themeScope };
    internal bool ShowCloseButton => _showCloseButton;
    internal List<DialogAction> Actions => _actions;
}
