using Bluent.UI.Components.PropertyEditorComponent;
using Microsoft.AspNetCore.Components;

namespace Bluent.UI.Components;

public partial class PropertyEditor
{
    private object? _object = null;
    private PropertyEditorContext? _context;

    [Parameter] public int LabelWidth { get; set; } = 120;
    [Parameter] public object? EditorRootObject { get; set; }
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

    public override IEnumerable<string> GetClasses()
    {
        foreach (var c in base.GetClasses())
            yield return c;

        yield return "bui-property-editor";
    }

}
