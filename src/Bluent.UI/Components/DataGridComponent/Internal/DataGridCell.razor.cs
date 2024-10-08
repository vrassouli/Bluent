using Microsoft.AspNetCore.Components;

namespace Bluent.UI.Components.DataGridComponent.Internal;

public partial class DataGridCell<TItem> where TItem : class
{
    [Parameter, EditorRequired] public DataGridColumn<TItem> Column { get; set; } = default!;
    [Parameter] public TItem? Item { get; set; }

    private RenderFragment? GetContent()
    {
        if (Item is null)
        {
            return builder =>
            {
                builder.OpenElement(0, "div");
                builder.AddAttribute(1, "class", GetContentClass());
                builder.AddContent(2, Column.GetHeader());
                builder.CloseElement();
            };
        }

        if (Column.ChildContent != null)
            return Column.ChildContent.Invoke(Item);

        return builder =>
        {
            builder.OpenElement(0, "div");
            builder.AddAttribute(1, "class", GetContentClass());
            builder.AddContent(2, Column.GetData(Item));
            builder.CloseElement();
        };
    }

    private string GetStyle() => Column.GetStyle();
    private string GetClass() => string.Join(' ', Column.GetClasses(Item));
    private string GetContentClass()
    {
        return string.Join(' ', ["content", Column.Wrap ? null : "text-truncate"]);
    }
}
