using Bluent.UI.Diagrams.Components;
using Microsoft.AspNetCore.Components.Web;

namespace Bluent.UI.Diagrams.Tools;

public class PointerLogTool : ISvgTool
{
    private SvgCanvas? _canvas;

    public string Cursor => "crosshair";

    public void Register(SvgCanvas svgCanvas)
    {
        _canvas = svgCanvas;

        _canvas.PointerCancel += OnPointerCancel;
        _canvas.PointerDown += OnPointerDown;
        _canvas.PointerEnter += OnPointerEnter;
        _canvas.PointerLeave += OnPointerLeave;
        _canvas.PointerMove += OnPointerMove;
        _canvas.PointerOut += OnPointerOut;
        _canvas.PointerOver += OnPointerOver;
        _canvas.PointerUp += OnPointerUp;
    }

    public void Unregister()
    {
        if (_canvas != null)
        {
            _canvas.PointerCancel -= OnPointerCancel;
            _canvas.PointerDown -= OnPointerDown;
            _canvas.PointerEnter -= OnPointerEnter;
            _canvas.PointerLeave -= OnPointerLeave;
            _canvas.PointerMove -= OnPointerMove;
            _canvas.PointerOut -= OnPointerOut;
            _canvas.PointerOver -= OnPointerOver;
            _canvas.PointerUp -= OnPointerUp;
        }
    }

    private void OnPointerCancel(object? sender, PointerEventArgs e) => LogEvent(e);

    private void OnPointerDown(object? sender, PointerEventArgs e) => LogEvent(e);

    private void OnPointerEnter(object? sender, PointerEventArgs e) => LogEvent(e);

    private void OnPointerLeave(object? sender, PointerEventArgs e) => LogEvent(e);

    private void OnPointerMove(object? sender, PointerEventArgs e) => LogEvent(e);

    private void OnPointerOut(object? sender, PointerEventArgs e) => LogEvent(e);

    private void OnPointerOver(object? sender, PointerEventArgs e) => LogEvent(e);

    private void OnPointerUp(object? sender, PointerEventArgs e) => LogEvent(e);

    private static void LogEvent(PointerEventArgs args)
    {
        Console.WriteLine($"{args.Type}:");
        Console.WriteLine($"PointerId: {args.PointerId}");
        Console.WriteLine($"PointerType: {args.PointerType}");
        Console.WriteLine($"ClientX: {args.ClientX}");
        Console.WriteLine($"ClientY: {args.ClientY}");
        Console.WriteLine($"OffsetX: {args.OffsetX}");
        Console.WriteLine($"OffsetY: {args.OffsetY}");
        Console.WriteLine($"Shift: {args.ShiftKey}, Control: {args.CtrlKey}, Alt: {args.AltKey}");
    }

}
