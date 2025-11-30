using Microsoft.AspNetCore.Components.Web;

namespace Bluent.UI.Interops.Abstractions;

public interface IPointerUpEventHandler
{
    Task OnPointerUp(PointerEventArgs args);
}