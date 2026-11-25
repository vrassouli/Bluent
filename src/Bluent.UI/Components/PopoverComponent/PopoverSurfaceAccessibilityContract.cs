using System.Text.RegularExpressions;

namespace Bluent.UI.Components;

/// <summary>
/// Validates the explicit ARIA contract for a detached Popover surface.
/// The component forwards these values only; it does not implement the role's interaction model.
/// </summary>
internal static class PopoverSurfaceAccessibilityContract
{
    private static readonly HashSet<string> RolesWithAuthorProvidedNames = new(StringComparer.Ordinal)
    {
        "alert", "alertdialog", "application", "article", "banner", "blockquote", "button", "cell",
        "checkbox", "columnheader", "combobox", "complementary", "contentinfo", "definition", "dialog",
        "document", "feed", "figure", "form", "grid", "gridcell", "group", "heading", "img", "link",
        "list", "listbox", "listitem", "log", "main", "marquee", "math", "meter", "menu", "menubar",
        "menuitem", "menuitemcheckbox", "menuitemradio", "navigation", "note", "option", "progressbar",
        "radio", "radiogroup", "region", "row", "rowgroup", "rowheader", "scrollbar", "search",
        "searchbox", "separator", "status", "switch", "tab", "table", "tablist", "tabpanel", "term",
        "time", "timer", "toolbar", "tooltip", "tree", "treegrid", "treeitem"
    };

    private static readonly HashSet<string> SupportedRoles = new(RolesWithAuthorProvidedNames, StringComparer.Ordinal)
    {
        "caption", "code", "deletion", "emphasis", "generic", "insertion", "none", "paragraph",
        "presentation", "strong", "subscript", "superscript"
    };

    private static readonly HashSet<string> RolesRequiringAuthorProvidedNames = new(StringComparer.Ordinal)
    {
        "alertdialog", "application", "button", "checkbox", "columnheader", "combobox", "dialog", "grid",
        "heading", "img", "link", "listbox", "marquee", "meter", "menuitem", "menuitemcheckbox",
        "menuitemradio", "option", "progressbar", "radio", "radiogroup", "region", "rowheader", "searchbox",
        "slider", "spinbutton", "switch", "table", "tabpanel", "textbox", "tooltip", "tree", "treegrid",
        "treeitem"
    };

    private static readonly HashSet<string> RolesProhibitingAuthorProvidedNames = new(StringComparer.Ordinal)
    {
        "caption", "code", "deletion", "emphasis", "generic", "insertion", "none", "paragraph",
        "presentation", "strong", "subscript", "superscript"
    };

    private static readonly Regex RoleToken = new("^[a-z][a-z0-9-]*$", RegexOptions.CultureInvariant | RegexOptions.Compiled);

    internal static void Validate(string? role, string? ariaLabel, string? ariaLabelledBy)
    {
        if (role is not null && (string.IsNullOrWhiteSpace(role) || !RoleToken.IsMatch(role) || !SupportedRoles.Contains(role)))
            throw new ArgumentException("SurfaceRole must be one supported, canonical lowercase ARIA role token.", nameof(role));

        if (ariaLabel is not null && string.IsNullOrWhiteSpace(ariaLabel))
            throw new ArgumentException("SurfaceAriaLabel must be nonempty when supplied.", nameof(ariaLabel));

        if (ariaLabelledBy is not null && string.IsNullOrWhiteSpace(ariaLabelledBy))
            throw new ArgumentException("SurfaceAriaLabelledBy must contain one or more ID references.", nameof(ariaLabelledBy));

        if (ariaLabel is not null && ariaLabelledBy is not null)
            throw new ArgumentException("Use either SurfaceAriaLabel or SurfaceAriaLabelledBy, not both.");

        if (ariaLabel is null && ariaLabelledBy is null)
        {
            if (role is not null && RolesRequiringAuthorProvidedNames.Contains(role))
                throw new ArgumentException($"The ARIA role '{role}' requires an accessible name.", nameof(role));
            return;
        }

        if (role is null)
            throw new ArgumentException("A Popover surface accessible name requires an explicit SurfaceRole.");

        if (RolesProhibitingAuthorProvidedNames.Contains(role) || !RolesWithAuthorProvidedNames.Contains(role))
            throw new ArgumentException($"The ARIA role '{role}' does not permit a name from author in this Popover contract.", nameof(role));
    }
}
