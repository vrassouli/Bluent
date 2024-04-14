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

    public Task<dynamic?> ShowAsync(RenderFragment content, ToastConfiguration config)
    {
        var context = new ToastContext(content, config);

        ShowToast?.Invoke(this, new ShowToastEventArgs(context));

        return context.ResultTCS.Task;
    }

    public Task<dynamic?> ShowAsync(string title, ToastConfiguration config)
    {
        return ShowAsync(title, null, config);
    }

    public Task<dynamic?> ShowAsync(string title, string? message, ToastConfiguration config)
    {
        var content = GetContentFragment(title, message, config);

        return ShowAsync(content, config);
    }

    public Task<dynamic?> ShowAsync<TContent>(ToastConfiguration config, object? parameters = null) where TContent : ComponentBase
    {
        var content = GetContentFragment<TContent>(parameters);

        return ShowAsync(content, config);
    }

    private RenderFragment GetContentFragment(string title, string? message, ToastConfiguration config)
    {
        return builder =>
        {
            builder.OpenComponent<DefaultToastContent>(0);
            builder.AddAttribute(1, nameof(DefaultToastContent.Title), title);
            builder.AddAttribute(2, nameof(DefaultToastContent.Message), message);
            builder.AddAttribute(3, nameof(DefaultToastContent.Config), config);
            builder.CloseComponent();
        };
    }

    private RenderFragment GetContentFragment<TContent>(object? parameters) where TContent : ComponentBase
    {
        return builder =>
        {
            builder.OpenComponent<TContent>(0);
            builder.CloseComponent();
        };
    }
}
