using Microsoft.AspNetCore.Components.Web;

namespace Bluent.UI.Interops.Abstractions;

public interface IPointerMoveEventHandler
{
    Task OnPointerMove(PointerEventArgs args);
}
