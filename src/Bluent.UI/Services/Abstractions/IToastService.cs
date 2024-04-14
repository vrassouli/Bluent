using Bluent.UI.Components;
using Microsoft.AspNetCore.Components;

namespace Bluent.UI.Services.Abstractions;

public interface IToastService
{
    Task<dynamic?> ShowAsync(RenderFragment content, ToastConfiguration config);
    Task<dynamic?> ShowAsync(string title, ToastConfiguration config);
    Task<dynamic?> ShowAsync(string title, string? message, ToastConfiguration config);
    Task<dynamic?> ShowAsync<TContent>(ToastConfiguration config, object? parameters = null) where TContent : ComponentBase;
}
