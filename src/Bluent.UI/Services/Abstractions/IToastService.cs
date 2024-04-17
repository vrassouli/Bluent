using Bluent.UI.Components;
using Microsoft.AspNetCore.Components;

namespace Bluent.UI.Services.Abstractions;

public interface IToastService
{
    Task<dynamic?> ShowAsync(RenderFragment content, ToastConfiguration? config = null);
    Task<dynamic?> ShowAsync(string title, string? message = null, ToastIntend intend = ToastIntend.None, string? dismissTitle = null, ToastConfiguration? config = null);
    Task<dynamic?> ShowAsync<TContent>(ToastConfiguration? config = null, IEnumerable<KeyValuePair<string, object?>>? parameters = null) where TContent : ComponentBase;
}
