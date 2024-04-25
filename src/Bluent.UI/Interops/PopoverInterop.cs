using Bluent.UI.Components;
using Bluent.UI.Interops.Abstractions;
using Microsoft.JSInterop;

namespace Bluent.UI.Interops
{
    internal class PopoverInterop : IAsyncDisposable
    {
        private readonly Lazy<Task<IJSObjectReference>> _moduleTask;
        private readonly IPopoverEventHandler _handler;
        private IJSObjectReference? _module;
        private IJSObjectReference? _popoverReference;
        private DotNetObjectReference<IPopoverEventHandler>? _handlerReference;

        private DotNetObjectReference<IPopoverEventHandler> HandlerReference
        {
            get
            {
                if (_handlerReference == null)
                    _handlerReference = DotNetObjectReference.Create(_handler);

                return _handlerReference;
            }
        }

        public PopoverInterop(IPopoverEventHandler handler, IJSRuntime jsRuntime)
        {
            _handler = handler;
            _moduleTask = new(() => jsRuntime.InvokeAsync<IJSObjectReference>("import", "./_content/Bluent.UI/bluent.ui.js").AsTask());
        }

        public async ValueTask DisposeAsync()
        {
            try
            {
                if (_popoverReference != null)
                    await _popoverReference.DisposeAsync();

                if (_module != null)
                    await _module.DisposeAsync();

                if (_handlerReference != null)
                    _handlerReference.Dispose();
            }
            catch (Exception)
            {
                // swallow!
            }
        }

        public async void SetPopover(PopoverSettings settings)
        {
            var module = await GetModuleAsync();
            await module.InvokeVoidAsync("setPopover", settings);
        }

        public async void ShowSurface(PopoverSettings settings)
        {
            var module = await GetModuleAsync();
            await module.InvokeVoidAsync("showSurface", settings);
        }

        private async Task<IJSObjectReference> GetModuleAsync()
        {
            if (_module == null)
                _module = await _moduleTask.Value;

            if (_popoverReference == null)
                _popoverReference = await _module.InvokeAsync<IJSObjectReference>("Popover.create", HandlerReference);

            return _popoverReference;
        }
    }
}
