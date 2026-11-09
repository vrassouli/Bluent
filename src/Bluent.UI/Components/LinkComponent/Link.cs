using Humanizer;
using Microsoft.AspNetCore.Components;
using Microsoft.AspNetCore.Components.Rendering;

namespace Bluent.UI.Components;

public class Link : BluentUiComponentBase
{
    [Parameter, EditorRequired] public string Text { get; set; } = default!;
    [Parameter] public string? Href { get; set; }
    [Parameter] public LinkAppearance Appearance { get; set; } = LinkAppearance.Default;
    [Parameter] public EventCallback OnClick { get; set; }

    public override IEnumerable<string> GetClasses()
    {
        yield return "bui-link";

        if (Appearance != LinkAppearance.Default)
            yield return Appearance.ToString().Kebaberize();
    }

    protected override void BuildRenderTree(RenderTreeBuilder builder)
    {
        // Resolve the destination once so null, empty and whitespace-only values
        // consistently select the native action fallback.
        var href = string.IsNullOrWhiteSpace(Href) ? null : Href;
        var isNavigation = href is not null;
        var isDisabled = IsLinkDisabled;

        builder.OpenElement(0, isNavigation ? "a" : "button");
        builder.AddMultipleAttributes(1, GetAdditionalAttributes(isDisabled));

        if (isNavigation)
        {
            if (isDisabled)
            {
                // An anchor without href is not natively focusable or exposed as a
                // link by every browser. Preserve its discoverability and name.
                builder.AddAttribute(2, "role", "link");
                builder.AddAttribute(3, "aria-disabled", "true");
                builder.AddAttribute(4, "tabindex", "0");
            }
            else
            {
                builder.AddAttribute(5, "href", href);
            }
        }
        else
        {
            builder.AddAttribute(6, "type", "button");
            if (isDisabled)
                builder.AddAttribute(7, "disabled", true);
        }

        builder.AddAttribute(8, "id", Id);
        builder.AddAttribute(9, "class", GetComponentClass());
        builder.AddAttribute(10, "style", Style);
        builder.AddAttribute(11, "onclick", EventCallback.Factory.Create(this, ClickHandler));
        builder.AddContent(12, Text);
        builder.CloseElement();
    }

    private bool IsLinkDisabled =>
        AdditionalAttributes?.Any(attribute =>
            string.Equals(attribute.Key, "disabled", StringComparison.OrdinalIgnoreCase) &&
            attribute.Value is not null &&
            attribute.Value is not false) == true;

    private IEnumerable<KeyValuePair<string, object>>? GetAdditionalAttributes(bool isDisabled)
    {
        if (AdditionalAttributes is null)
            return null;

        return AdditionalAttributes.Where(attribute =>
        {
            var name = attribute.Key;

            // Link owns destination, native action type, disabled state and click
            // handling. Filter case-insensitively to avoid duplicate/conflicting
            // HTML attributes supplied through @attributes.
            if (IsAttribute(name, "href") ||
                IsAttribute(name, "type") ||
                IsAttribute(name, "disabled") ||
                IsAttribute(name, "onclick"))
            {
                return false;
            }

            // Disabled semantics and keyboard discoverability are component-owned.
            if (isDisabled &&
                (IsAttribute(name, "role") ||
                 IsAttribute(name, "aria-disabled") ||
                 IsAttribute(name, "tabindex")))
            {
                return false;
            }

            return true;
        });
    }

    private static bool IsAttribute(string name, string expected) =>
        string.Equals(name, expected, StringComparison.OrdinalIgnoreCase);

    private Task ClickHandler()
    {
        if (IsLinkDisabled)
            return Task.CompletedTask;

        // Do not call preventDefault: enabled anchors retain native browser
        // navigation, while the optional callback remains additive.
        return InvokeAsync(OnClick.InvokeAsync);
    }
}