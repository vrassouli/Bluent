using Bluent.UI.Diagrams.Elements;
using Bluent.UI.Diagrams.Extensions;
using Microsoft.AspNetCore.Components.Web;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Bluent.UI.Diagrams.Tools;

public class DrawLineTool : SvgDrawingToolBase
{
    private long? _pointerId;
    private DiagramPoint? _startPoint;
    private LineElement? _element;

    public override string Cursor => "crosshair";

    protected override void OnPointerDown(PointerEventArgs e)
    {
        if (_pointerId is not null || Canvas is null)
            return;

        _pointerId = e.PointerId;
        _startPoint = Canvas.ScreenToDiagram(e.ToOffsetPoint());

        _element = new LineElement(_startPoint.X, _startPoint.Y, _startPoint.X, _startPoint.Y);
        _element.Fill = Fill;
        _element.Stroke = Stroke;
        _element.StrokeWidth = StrokeWidth;

        Canvas?.AddElement(_element);
    }

    protected override void OnPointerUp(PointerEventArgs e)
    {
        if (_pointerId is not null)
            NotifyOperationCompleted();

        _pointerId = null;
        _element = null;
        _startPoint = null;
    }

    protected override void OnPointerCancel(PointerEventArgs e)
    {
        _pointerId = null;

        if (_element is not null)
        {
            Canvas?.RemoveElement(_element);
            _element = null;
        }
    }

    protected override void OnPointerMove(PointerEventArgs e)
    {
        if (_pointerId is null || Canvas is null)
            return;

        var endPoint = Canvas.ScreenToDiagram(e.ToOffsetPoint());

        if (_element is not null)
        {
            _element.X2 = endPoint.X;
            _element.Y2 = endPoint.Y;
        }

        //_width = e.OffsetX - (_startPoint?.X ?? 0);
        //_height = e.OffsetY - (_startPoint?.Y ?? 0);

        //if (_element is not null)
        //{
        //    // As rect does not support negative width and height
        //    // we have to shift the rect in x or y axis
        //    if (_width < 0)
        //    {
        //        _element.X1 = ((_startPoint?.X ?? 0) + _width);
        //        _element.X2 = ((_startPoint?.X ?? 0) + _width);
        //    }

        //    if (_height < 0)
        //    {
        //        _element.Y1 = ((_startPoint?.Y ?? 0) + _height);
        //        _element.Y2 = ((_startPoint?.Y ?? 0) + _height);
        //    }

        //    _element.Width = Math.Abs(_width);
        //    _element.Height = Math.Abs(_height);
        //}
    }
}
