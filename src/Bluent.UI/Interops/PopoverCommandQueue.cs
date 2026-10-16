using Bluent.UI.Components;

namespace Bluent.UI.Interops;

/// <summary>
/// Orders synchronous PopoverService notifications for awaited execution only
/// after the interactive container has rendered its trigger and surface DOM.
/// This internal coordinator does not change IPopoverService's public API.
/// </summary>
internal sealed class PopoverCommandQueue
{
    private readonly Queue<(bool Show, PopoverSettings Settings, bool Destroy)> _pending = new();
    private bool _draining;

    public int Count => _pending.Count;

    public void Enqueue(bool show, PopoverSettings settings) =>
        _pending.Enqueue((show, settings, false));

    public void EnqueueDestroy(PopoverSettings settings) =>
        _pending.Enqueue((false, settings, true));

    public void Clear() => _pending.Clear();

    // Keep the previous DrainAsync API for existing internal callers/fake
    // JS lifecycle tests. Destruction is a separately named ordered drain.
    public Task DrainAsync(Func<bool, PopoverSettings, Task> execute) =>
        DrainCoreAsync(execute, _ => throw new InvalidOperationException(
            "Popover child destroy requires a JS destroy callback."));

    public Task DrainWithDestroyAsync(Func<bool, PopoverSettings, Task> execute,
        Func<string, Task> destroy) => DrainCoreAsync(execute, destroy);

    private async Task DrainCoreAsync(Func<bool, PopoverSettings, Task> execute,
        Func<string, Task> destroy)
    {
        if (_draining)
            return;

        _draining = true;
        try
        {
            while (_pending.TryDequeue(out var command))
            {
                if (command.Destroy)
                    await destroy(command.Settings.TriggerId);
                else
                    await execute(command.Show, command.Settings);
            }
        }
        finally
        {
            _draining = false;
        }
    }
}
