using Bluent.UI.Components.DialogComponent;

namespace Bluent.UI.Components;

public class DialogConfigurator
{
    private bool _modal = true;
    private DialogSize _size = DialogSize.Medium;
    private PortalThemeScope? _themeScope;
    private string? _accessibleName;
    private string? _closeButtonLabel;
    private string? _returnFocusTargetId;
    private bool _enableModalKeyboard;
    private string? _initialFocusTargetId;
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
    /// <summary>Opt-in accessible Dialog name and localized icon-only dismiss label (#418 prototype).</summary>
    public DialogConfigurator SetAccessibleDialog(string name, string closeButtonLabel)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(name);
        ArgumentException.ThrowIfNullOrWhiteSpace(closeButtonLabel);
        _accessibleName = name;
        _closeButtonLabel = closeButtonLabel;
        return this;
    }

    /// <summary>Opt-in return of focus to an explicitly named launcher after the final Dialog dismisses.</summary>
    public DialogConfigurator SetReturnFocusTargetId(string elementId)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(elementId);
        _returnFocusTargetId = elementId;
        return this;
    }
    /// <summary>Experimental opt-in Tab/Shift+Tab/Escape handling for a named modal Dialog.</summary>
    public DialogConfigurator SetModalKeyboardNavigation(bool enabled = true)
    {
        _enableModalKeyboard = enabled;
        return this;
    }
    /// <summary>Experimental opt-in initial focus on a visible enabled element inside the named Dialog.</summary>
    public DialogConfigurator SetInitialFocusTargetId(string elementId)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(elementId);
        _initialFocusTargetId = elementId;
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

    internal DialogConfiguration Configuration => new DialogConfiguration(_modal, _size) { ThemeScope = _themeScope, AccessibleName = _accessibleName, CloseButtonLabel = _closeButtonLabel, ReturnFocusTargetId = _returnFocusTargetId, EnableModalKeyboard = _enableModalKeyboard, InitialFocusTargetId = _initialFocusTargetId };
    internal bool ShowCloseButton => _showCloseButton;
    internal List<DialogAction> Actions => _actions;
}
