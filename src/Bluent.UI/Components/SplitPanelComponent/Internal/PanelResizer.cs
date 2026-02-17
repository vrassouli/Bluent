using Bluent.UI.Interops.Abstractions;
using Bluent.UI.Services.Abstractions;
using Microsoft.AspNetCore.Components;
using Microsoft.AspNetCore.Components.Rendering;
using Microsoft.AspNetCore.Components.Web;
using Microsoft.JSInterop;

namespace Bluent.UI.Components.SplitPanelComponent.Internal;

public class PanelResizer : BluentUiComponentBase, IPointerUpEventHandler, IPointerMoveEventHandler
{
    private long? _capturedPointerId;
    [Parameter] public SplitArea SplitArea { get; set; }
    [Parameter] public bool Floating { get; set; }
    [Parameter] public int? Size { get; set; }
    [CascadingParameter] public SplitPanelContainer Container { get; set; } = default!;
    [Inject] private IDomHelper DomHelper { get; set; } = default!;

    private string AreaClass => $"{SplitArea}-resizer".ToLower();

    private string GripIcon => SplitArea switch
    {
        SplitArea.Top or SplitArea.Bottom or SplitArea.Header or SplitArea.Footer
            => "icon-ic_fluent_more_horizontal_20_regular",
        SplitArea.Start or SplitArea.End or SplitArea.StartSide or SplitArea.EndSide
            => "icon-ic_fluent_more_vertical_20_regular",
        _ => string.Empty
    };

    private string? PositionStyle
    {
        get
        {
            if (!Floating)
                return null;

            if (Size is null)
                return null;

            var style = SplitArea switch
            {
                SplitArea.Header or SplitArea.Top => "top",

                SplitArea.Footer or SplitArea.Bottom => "bottom",


                SplitArea.Start or SplitArea.StartSide => "left",
                SplitArea.End or SplitArea.EndSide => "right",

                _ => throw new ArgumentOutOfRangeException()
            };

            return $"{style}:{Size}px";
        }
    }

    protected override void OnInitialized()
    {
        if (Container == null!)
        {
            throw new InvalidOperationException(
                $"{nameof(SplitPanel)} must be nested inside a {nameof(SplitPanelContainer)}.");
        }

        base.OnInitialized();
    }

    protected override async Task OnAfterRenderAsync(bool firstRender)
    {
        if (firstRender && RendererInfo.IsInteractive)
        {
            await DomHelper.RegisterPointerUpHandler(this);
            await DomHelper.RegisterPointerMoveHandler(this);
        }

        await base.OnAfterRenderAsync(firstRender);
    }

    public override async ValueTask DisposeAsync()
    {
        try
        {
            if (RendererInfo.IsInteractive)
            {
                await DomHelper.UnregisterPointerUpHandler(this);
                await DomHelper.UnregisterPointerMoveHandler(this);
            }
        }
        catch (JSDisconnectedException)
        {
            // Swallow
        }

        await base.DisposeAsync();
    }

    protected override void BuildRenderTree(RenderTreeBuilder builder)
    {
        var seq = -1;

        builder.OpenElement(++seq, "div");
        builder.AddAttribute(++seq, "class", $"panel-resizer {AreaClass}");
        builder.AddAttribute(++seq, "style", $"{PositionStyle}");
        builder.AddAttribute(
            ++seq,
            "onpointerdown",
            EventCallback.Factory.Create<PointerEventArgs>(this, OnPointerDown));

        builder.OpenComponent<Icon>(++seq);
        builder.AddComponentParameter(++seq, nameof(Icon.Content), GripIcon);
        builder.CloseComponent();

        builder.CloseElement();
    }

    private async Task OnPointerDown(PointerEventArgs e)
    {
        _capturedPointerId = e.PointerId;

        await Container.StartResize(SplitArea, e);
    }

    [JSInvokable]
    public Task OnPointerUp(PointerEventArgs args)
    {
        // Check and stop resize...
        if (_capturedPointerId == args.PointerId)
            _capturedPointerId = null;

        return Task.CompletedTask;
    }

    [JSInvokable]
    public Task OnPointerMove(PointerEventArgs args)
    {
        if (_capturedPointerId == args.PointerId && Floating)
            StateHasChanged();

        return Task.CompletedTask;
    }
}