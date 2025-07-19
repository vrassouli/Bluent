using Bluent.UI.Diagrams.Components;
using Bluent.UI.Diagrams.Elements;
using Microsoft.AspNetCore.Components.Web;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Bluent.UI.Diagrams.Tools;

public class DrawCircleTool : ISvgDrawingTool
{
    private SvgCanvas? _canvas;
    private long? _pointerId;
    private double? _cx;
    private double? _cy;
    private double _r;
    private CircleElement? _element;

    public string Cursor => "crosshair";

    public string? Fill { get; set; }
    public string? Stroke { get; set; }
    public string? StrokeWidth { get; set; }

    public void Register(SvgCanvas svgCanvas)
    {
        _canvas = svgCanvas;
        _canvas.PointerDown += OnPointerDown;
        _canvas.PointerUp += OnPointerUp;
        _canvas.PointerCancel += OnPointerCancel;
        _canvas.PointerMove += OnPointerMove;
    }

    public void Unregister()
    {
        if (_canvas is not null)
        {
            _canvas.PointerDown -= OnPointerDown;
        }
    }

    private void OnPointerDown(object? sender, PointerEventArgs e)
    {
        if (_pointerId is not null)
            return;

        _pointerId = e.PointerId;

        _cx = e.OffsetX;
        _cy = e.OffsetY;

        _element = new CircleElement(_cx.ToString() ?? "0", _cy.ToString() ?? "0", _r.ToString());
        _element.Fill = Fill;
        _element.Stroke = Stroke;
        _element.StrokeWidth = StrokeWidth;
        _canvas?.AddElement(_element);
    }

    private void OnPointerUp(object? sender, PointerEventArgs e)
    {
        _pointerId = null;
        _element = null;
        _cx = null;
        _cy = null;
        _r = 0;
    }

    private void OnPointerCancel(object? sender, PointerEventArgs e)
    {
        _pointerId = null;

        if (_element is not null)
        {
            _canvas?.RemoveElement(_element);
            _element = null;
        }
    }

    private void OnPointerMove(object? sender, PointerEventArgs e)
    {
        if (_pointerId is null)
            return;

        _r = e.OffsetX - (_cx ?? 0);

        if (_element is not null)
        {
            _element.R = Math.Abs(_r).ToString();
        }
    }
}
