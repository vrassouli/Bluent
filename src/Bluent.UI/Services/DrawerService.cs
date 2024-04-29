using Bluent.UI.Components;
using Bluent.UI.Components.DrawerComponent;
using Bluent.UI.Services.Abstractions;
using Bluent.UI.Services.EventArguments;
using Microsoft.AspNetCore.Components;

namespace Bluent.UI.Services;

internal class DrawerService : IDrawerService
{
    public event EventHandler<ShowDrawerEventArgs>? ShowDrawer;

    public Task<dynamic?> ShowAsync(RenderFragment content, DrawerConfiguration? config = null)
    {
        var context = new DrawerContext(content, config ?? new());

        ShowDrawer?.Invoke(this, new ShowDrawerEventArgs(context));

        return context.ResultTCS.Task;
    }

    public Task<dynamic?> ShowAsync<TContentComponent>(string title,
                                                       IDictionary<string, object?>? parameters = null,
                                                       Action<DrawerConfigurator>? configBuilder = null)
        where TContentComponent : ComponentBase
    {
        var configurator = new DrawerConfigurator();
        configBuilder?.Invoke(configurator);

        var content = GetContentFragment<TContentComponent>(title,
                                                            parameters,
                                                            configurator.ShowCloseButton);

        return ShowAsync(content, configurator.Configuration);
    }

    public Task<dynamic?> ShowAsync<TContentComponent>(IDictionary<string, object?>? parameters = null,
                                                       DrawerConfiguration? config = null) where TContentComponent : ComponentBase
    {
        var content = GetContentFragment<TContentComponent>(parameters);

        return ShowAsync(content, config);
    }

    private RenderFragment GetContentFragment<TContentComponent>(IDictionary<string, object?>? parameters) where TContentComponent : ComponentBase
    {
        return builder =>
        {
            builder.OpenComponent<TContentComponent>(0);
            builder.AddMultipleAttributes(1, parameters!);
            builder.CloseComponent();
        };
    }

    private RenderFragment GetContentFragment<TContentComponent>(string title,
                                                                 IDictionary<string, object?>? parameters,
                                                                 bool showCloseButton) where TContentComponent : ComponentBase
    {
        return builder =>
        {
            builder.OpenComponent<DrawerContent>(0);
            builder.AddAttribute(1, nameof(DrawerContent.Title), title);
            builder.AddAttribute(2, nameof(DrawerContent.ShowDismissButton), showCloseButton);
            builder.AddAttribute(3, nameof(DrawerContent.ContentComponentType), typeof(TContentComponent));
            builder.AddAttribute(4, nameof(DrawerContent.ContentParameters), parameters);
            builder.CloseComponent();
        };
    }
}
