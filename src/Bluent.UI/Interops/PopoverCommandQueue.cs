using Bluent.UI.Components;

namespace Bluent.UI.Interops;

/// <summary>
/// Orders synchronous PopoverService notifications for awaited execution only
/// after the interactive container has rendered its trigger and surface DOM.
/// This internal coordinator does not change IPopoverService's public API.
/// </summary>
internal sealed class PopoverCommandQueue
{
    private readonly Queue<(bool Show, PopoverSettings Settings)> _pending = new();
    private bool _draining;

    public int Count => _pending.Count;

    public void Enqueue(bool show, PopoverSettings settings) =>
        _pending.Enqueue((show, settings));

    public void Clear() => _pending.Clear();

    public async Task DrainAsync(Func<bool, PopoverSettings, Task> execute)
    {
        if (_draining)
            return;

        _draining = true;
        try
        {
            while (_pending.TryDequeue(out var command))
                await execute(command.Show, command.Settings);
        }
        finally
        {
            _draining = false;
        }
    }
}
