using Bluent.UI.Components;
using Microsoft.AspNetCore.Components;

namespace Bluent.UI.Services.Abstractions;

internal interface IPopoverService
{
    void Show(string popoverId, RenderFragment content, Placement placement, bool displayArrow);
}
