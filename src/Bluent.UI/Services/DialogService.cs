using Bluent.UI.Components;
using Bluent.UI.Components.DialogComponent;
using Bluent.UI.Services.Abstractions;
using Bluent.UI.Services.EventArguments;
using Microsoft.AspNetCore.Components;

namespace Bluent.UI.Services;

internal class DialogService : IDialogService
{
    public event EventHandler<ShowDialogEventArgs>? ShowDialog;

    public Task<dynamic?> ShowAsync(RenderFragment content, DialogConfiguration? config = null)
    {
        var context = new DialogContext(content, config ?? new());

        ShowDialog?.Invoke(this, new ShowDialogEventArgs(context));

        return context.ResultTCS.Task;
    }

    public Task<dynamic?> ShowAsync<TContentComponent>(string title,
                                                       IDictionary<string, object?>? parameters = null,
                                                       Action<DialogConfigurator>? configBuilder = null)
        where TContentComponent : ComponentBase
    {
        var configurator = new DialogConfigurator();
        configBuilder?.Invoke(configurator);

        var content = GetContentFragment<TContentComponent>(title,
                                                            parameters,
                                                            configurator.ShowCloseButton,
                                                            configurator.Actions);

        return ShowAsync(content, configurator.Configuration);
    }

    public Task<dynamic?> ShowAsync<TContentComponent>(IDictionary<string, object?>? parameters = null,
                                                       DialogConfiguration? config = null) where TContentComponent : ComponentBase
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
                                                                 bool showCloseButton,
                                                                 List<DialogAction> actions) where TContentComponent : ComponentBase
    {
        return builder =>
        {
            builder.OpenComponent<DialogDefaultContent>(0);
            builder.AddAttribute(1, nameof(DialogDefaultContent.Title), title);
            builder.AddAttribute(2, nameof(DialogDefaultContent.ShowCloseButton), showCloseButton);
            builder.AddAttribute(3, nameof(DialogDefaultContent.ContentComponentType), typeof(TContentComponent));
            builder.AddAttribute(4, nameof(DialogDefaultContent.ContentParameters), parameters);
            builder.AddAttribute(4, nameof(DialogDefaultContent.Actions), actions);
            builder.CloseComponent();
        };
    }
}
