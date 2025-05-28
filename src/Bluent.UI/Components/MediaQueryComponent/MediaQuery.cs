using Bluent.UI.Services.Abstractions;
using Microsoft.AspNetCore.Components;

namespace Bluent.UI.Components;

internal class MediaQuery : ComponentBase
{
    [Inject] public IDomHelper DomHelper { get; set; } = null!;
    [Parameter] public EventCallback<Breakpoints> OnChange { get; set; }

    protected override async Task OnAfterRenderAsync(bool firstRender)
    {
        if (firstRender)
        {
            await SendInitialBreakpointAsync();
        }

        await base.OnAfterRenderAsync(firstRender);
    }

    private async Task SendInitialBreakpointAsync()
    {
        foreach (var breakpoint in Enum.GetValues<Breakpoints>().OrderByDescending(x => x))
        {
            var query = $"(min-width: {(int)breakpoint}px)";

            var matches = await DomHelper.MatchMediaAsync(query);
            if (matches)
            {
                await OnChange.InvokeAsync(breakpoint);
                return;
            }
        }
    }
}
