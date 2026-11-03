using Microsoft.AspNetCore.Components;

namespace Bluent.UI.Components;

public partial class MenuList
{
    private List<MenuItem> _items = new();

    [Parameter]
    public RenderFragment? ChildContent { get; set; }

    public override IEnumerable<string> GetClasses()
    {
        yield return "bui-menu-list";
    }

    internal void Add(MenuItem item)
    {
        if (!_items.Contains(item))
            _items.Add(item);
    }

    internal void Remove(MenuItem item)
    {
        _items.Remove(item);
    }

    internal bool ShouldRenderIconBox => _items.Any(x => x.Icon != null);
    internal bool ShouldRenderCheckmarkBox => _items.Any(x => x.Checked);

    private IEnumerable<KeyValuePair<string, object>> GetMenuListAttributes()
    {
        var attributes = AdditionalAttributes?
            .Where(attribute =>
                !string.Equals(attribute.Key, "role", StringComparison.OrdinalIgnoreCase) &&
                !string.Equals(attribute.Key, "id", StringComparison.OrdinalIgnoreCase) &&
                !string.Equals(attribute.Key, "class", StringComparison.OrdinalIgnoreCase) &&
                !string.Equals(attribute.Key, "style", StringComparison.OrdinalIgnoreCase) &&
                !string.Equals(attribute.Key, "aria-label", StringComparison.OrdinalIgnoreCase) &&
                !string.Equals(attribute.Key, "aria-labelledby", StringComparison.OrdinalIgnoreCase))
            .ToList() ?? [];

        var labelledBy = GetAttributeValue("aria-labelledby");
        if (!string.IsNullOrWhiteSpace(labelledBy))
        {
            attributes.Add(new KeyValuePair<string, object>("aria-labelledby", labelledBy));
        }
        else
        {
            attributes.Add(new KeyValuePair<string, object>(
                "aria-label",
                GetAttributeValue("aria-label") ?? "Menu"));
        }

        return attributes;
    }

    private string? GetAttributeValue(string name)
    {
        var attribute = AdditionalAttributes?.FirstOrDefault(
            item => string.Equals(item.Key, name, StringComparison.OrdinalIgnoreCase));

        return attribute?.Value?.ToString();
    }
}