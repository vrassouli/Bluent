using Bluent.UI.Components.DrawerComponent;
using Bluent.UI.Components;
using Bluent.UI.Services.Abstractions;
using Bluent.UI.Services.EventArguments;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Components;
using System.Reflection.Metadata;
using System.Security.Cryptography;
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
        //return builder =>
        //{
        //    builder.OpenComponent<DefaultToastContent>(0);
        //    builder.AddAttribute(1, nameof(DefaultToastContent.Title), title);
        //    builder.AddAttribute(2, nameof(DefaultToastContent.Message), message);
        //    builder.AddAttribute(3, nameof(DefaultToastContent.Intend), intend);
        //    builder.AddAttribute(3, nameof(DefaultToastContent.DismissTitle), dismissTitle);
        //    builder.CloseComponent();
        //};
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
