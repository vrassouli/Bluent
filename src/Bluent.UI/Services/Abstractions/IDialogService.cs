using Bluent.UI.Components;
using Microsoft.AspNetCore.Components;

namespace Bluent.UI.Services.Abstractions;

public interface IDialogService
{
    Task<dynamic?> ShowAsync(RenderFragment content, DialogConfiguration? config = null);
    Task<dynamic?> ShowAsync<TContentComponent>(IDictionary<string, object?>? parameters = null,
                                                DialogConfiguration? config = null) where TContentComponent : ComponentBase;
    Task<dynamic?> ShowAsync<TContentComponent>(string title,
                                                IDictionary<string, object?>? parameters = null,
                                                Action<DialogConfigurator>? builder = null) where TContentComponent : ComponentBase;
    Task<MessageBoxResult> ShowMessageBox(string title, string message);
    Task<MessageBoxResult> ShowMessageBox(string title, string message, MessageBoxButton buttons, MessageBoxButton? primaryButton = null);
}
