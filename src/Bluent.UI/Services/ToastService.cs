using Bluent.UI.Components;
using Bluent.UI.Services.Abstractions;
using Bluent.UI.Services.EventArguments;
using Microsoft.AspNetCore.Components;
using Bluent.UI.Components.ToastComponent;

namespace Bluent.UI.Services;

internal class ToastService : IToastService
{
    public event EventHandler<ShowToastEventArgs>? ShowToast;

    public Task<dynamic?> ShowAsync(RenderFragment content, ToastConfiguration? config = null)
    {
        var context = new ToastContext(content, config ?? new());

        ShowToast?.Invoke(this, new ShowToastEventArgs(context));

        return context.ResultTCS.Task;
    }

    public Task<dynamic?> ShowAsync(string title, string? message = null, ToastIntend intend = ToastIntend.None, string? dismissTitle = null, ToastConfiguration? config = null)
    {
        var content = GetContentFragment(title, message, intend, dismissTitle);

        return ShowAsync(content, config);
    }

    public Task<dynamic?> ShowAsync<TContent>(ToastConfiguration? config = null, IEnumerable<KeyValuePair<string, object?>>? parameters = null) where TContent : ComponentBase
    {
        var content = GetContentFragment<TContent>(parameters ?? Enumerable.Empty<KeyValuePair<string, object?>>());

        return ShowAsync(content, config);
    }

    private RenderFragment GetContentFragment(string title, string? message, ToastIntend intend, string? dismissTitle)
    {
        var parameters = new Dictionary<string, object?>
        {
            { nameof(DefaultToastContent.Title), title },
            { nameof(DefaultToastContent.Message), message },
            { nameof(DefaultToastContent.Intend), intend },
            { nameof(DefaultToastContent.DismissTitle), dismissTitle },
        };
        return GetContentFragment<DefaultToastContent>(parameters);
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
