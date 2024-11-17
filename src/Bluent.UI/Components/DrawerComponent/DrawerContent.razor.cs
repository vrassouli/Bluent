using Microsoft.AspNetCore.Components;

namespace Bluent.UI.Components;

public partial class DrawerContent
{
    [Parameter] public RenderFragment? ChildContent { get; set; } = default!;
    [Parameter] public Type? ContentComponentType { get; set; } = default!;
    [Parameter] public IDictionary<string, object?>? ContentParameters { get; set; }
    [Parameter] public string Title { get; set; } = default!;
    [Parameter] public bool ShowDismissButton { get; set; } = true;
    [CascadingParameter] public Drawer? Drawer { get; set; }

    private void CloseHandler()
    {
        Drawer?.Close();
    }
}
