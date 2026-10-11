using Bluent.UI.Components;

public class DialogConfiguration
{
    public DialogConfiguration(bool modal = true, DialogSize size = DialogSize.Medium)
    {
        Modal = modal;
        Size = size;
    }

    public bool Modal { get; }
    public DialogSize Size { get; }

    /// <summary>Experimental #418 opt-in theme context for detached portals.</summary>
    public PortalThemeScope? ThemeScope { get; init; }
    /// <summary>Opt-in accessible name for a v3 owned dialog. Null leaves existing v2 behavior unchanged.</summary>
    public string? AccessibleName { get; init; }
    /// <summary>Localized text alternative for the dismiss icon.</summary>
    public string? CloseButtonLabel { get; init; }
}
