using Bluent.UI.Components;
using Bluent.UI.Components.DialogComponent;
using Bluent.UI.Services.Abstractions;
using Bluent.UI.Services.EventArguments;
using Microsoft.AspNetCore.Components;

namespace Bluent.UI.Services;

internal class DialogService : IDialogService
{
    public event EventHandler<ShowDialogEventArgs>? ShowDialog;

    public Task<dynamic?> ShowAsync(string title, RenderFragment content, DialogConfiguration? config = null)
    {
        var context = new DialogContext(title, content, config ?? new());

        ShowDialog?.Invoke(this, new ShowDialogEventArgs(context));

        return context.ResultTCS.Task;
    }

    public Task<dynamic?> ShowAsync<TContent>(string title, DialogConfiguration? config = null, IEnumerable<KeyValuePair<string, object?>>? parameters = null) where TContent : ComponentBase
    {
        var content = GetContentFragment<TContent>(parameters ?? Enumerable.Empty<KeyValuePair<string, object?>>());

        return ShowAsync(title, content, config);
    }

    private RenderFragment GetContentFragment<TContent>(IEnumerable<KeyValuePair<string, object?>> parameters) where TContent : ComponentBase
    {
        return builder =>
        {
            builder.OpenComponent<TContent>(0);
            builder.AddMultipleAttributes(1, parameters!);
            builder.CloseComponent();
        };
    }
}
