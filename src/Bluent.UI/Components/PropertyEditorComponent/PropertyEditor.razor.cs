using Bluent.UI.Components.PropertyEditorComponent;
using Microsoft.AspNetCore.Components;

namespace Bluent.UI.Components;

public partial class PropertyEditor
{
    private object? _object = null;
    private PropertyEditorContext? _context;

    [Parameter] public int LabelWidth { get; set; } = 120;
    [Parameter] public object? Object { get; set; }
    [Parameter] public bool Categorize { get; set; } = true;
    [Parameter] public EventCallback PropertyUpdated { get; set; }

    protected override void OnParametersSet()
    {
        if (_object != Object)
        {
            _object = Object;

            if (_object != null)
                _context = new PropertyEditorContext(_object);
            else
                _context = null;
        }

        base.OnParametersSet();
    }

    //private IEnumerable<PropertyInfo> GetProperties()
    //{
    //    if (Object is null)
    //        return Enumerable.Empty<PropertyInfo>();

    //    return Object.GetType().GetProperties(BindingFlags.Public | BindingFlags.Instance)
    //            .Where(p => p.CanRead && p.CanWrite);

    //}
}
