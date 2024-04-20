using Microsoft.AspNetCore.Components;

namespace Bluent.UI.Components.PopoverComponent;

public class PopoverContext
{
    public PopoverContext(RenderFragment content, PopoverConfiguration config)
    {
        Content = content;
        Config = config;
    }

    public RenderFragment Content { get; }
    public PopoverConfiguration Config { get; }
    internal PopoverSurface? SurfaceReference { get; set; }
}
