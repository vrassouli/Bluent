using Microsoft.JSInterop;

namespace Bluent.UI.Components.NumericFieldComponent.Internal;

/// <summary>Internal JS interop adapter that keeps callback methods off the public component API.</summary>
internal sealed class NumericFieldKeyboardCallback
{
    private readonly Func<string, Task> _handleCommand;

    public NumericFieldKeyboardCallback(Func<string, Task> handleCommand)
    {
        _handleCommand = handleCommand ?? throw new ArgumentNullException(nameof(handleCommand));
    }

    [JSInvokable]
    public Task HandleNumericFieldKeyAsync(string command) => _handleCommand(command);
}
