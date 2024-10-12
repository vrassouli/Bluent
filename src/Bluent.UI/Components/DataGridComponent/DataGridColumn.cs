using Bluent.UI.Extensions;
using Microsoft.AspNetCore.Components;
using System.Linq.Expressions;

namespace Bluent.UI.Components;

public class DataGridColumn<TItem> : ComponentBase, IDisposable
    where TItem : class
{
    private Func<TItem, object?>? _fieldFunc;

    [CascadingParameter] public DataGrid<TItem> DataGrid { get; set; } = default!;
    [Parameter] public string? Header { get; set; }
    [Parameter] public Expression<Func<TItem, object?>>? Field { get; set; }
    [Parameter] public Func<TItem, IEnumerable<string>>? CellClasses { get; set; }
    [Parameter] public Func<IEnumerable<string>>? HeaderClasses { get; set; }
    [Parameter] public RenderFragment<TItem>? ChildContent { get; set; }
    [Parameter] public string? Format { get; set; }
    [Parameter] public double Width { get; set; } = 150;
    [Parameter] public bool Wrap { get; set; }
    [Parameter] public bool Freezed { get; set; }

    protected override void OnInitialized()
    {
        if (DataGrid == null)
            throw new ArgumentNullException($"{nameof(DataGridColumn<TItem>)} needs to be nested inside of a {nameof(DataGrid<TItem>)}.");

        DataGrid.AddColumn(this);

        base.OnInitialized();
    }

    public void Dispose()
    {
        DataGrid.RemoveColumn(this);
    }

    internal string GetHeader()
    {
        return Header ?? Field?.GetDisplayName() ?? string.Empty;
    }

    internal object? GetData(TItem item)
    {
        if (_fieldFunc == null && Field != null)
            _fieldFunc = Field.Compile();

        if (_fieldFunc != null)
        {
            var value = _fieldFunc.Invoke(item);

            if (value is Enum enumVal)
                value = enumVal.GetDisplayName();

            if (!string.IsNullOrEmpty(Format))
                return string.Format(Format, value);

            return value;
        }

        return null;
    }

    internal string GetStyle()
    {
        Dictionary<string, string> styles = new();

        if (Width != null)
        {
            styles.Add("width", $"{Width}px");
        }

        return string.Join(';', styles.Select(x => $"{x.Key}:{x.Value}"));
    }

    internal IEnumerable<string> GetClasses(TItem? item)
    {
        yield return "cell";

        //if (Width is null)
        //    yield return "flex-fill";

        if (item is not null && CellClasses is not null)
            foreach (var cellClass in CellClasses(item))
                yield return cellClass;
        else if (item is null && HeaderClasses is not null)
            foreach (var cellClass in HeaderClasses())
                yield return cellClass;
    }
}
