using Bluent.UI.Components;
using Microsoft.AspNetCore.Components;

namespace Bluent.UI.Services.Abstractions;

public interface IDialogService
{
    Task<dynamic?> ShowAsync(string title, RenderFragment content, DialogConfiguration? config = null);
    Task<dynamic?> ShowAsync<TContent>(string title, DialogConfiguration? config = null, IEnumerable<KeyValuePair<string, object?>>? parameters = null) where TContent : ComponentBase;
}
