using Bluent.UI.Interops.Abstractions;
using Bluent.UI.Services.Abstractions;
using Microsoft.AspNetCore.Components;
using Microsoft.AspNetCore.Components.Web;
using Microsoft.JSInterop;

namespace Bluent.UI.Components;

public partial class RangeSlider<TValue> : IPointerMoveEventHandler, IPointerUpEventHandler
{
    private int _thumbSize = 20;
    private TValue? _max;
    private TValue? _min;
    private readonly TValue? _minDefault = (TValue)(object)0;
    private readonly TValue? _maxDefault = (TValue)(object)100;
    private bool _maxHasValue;
    private bool _minHasValue;
    private long? _pointerId;

    [Parameter] public TValue? Min { get; set; }
    [Parameter] public TValue? Max { get; set; }
    [Parameter] public ValueRange<TValue>? Value { get; set; }
    [Parameter] public EventCallback<ValueRange<TValue>?> ValueChanged { get; set; }
    // [Parameter] public Orientation Orientation { get; set; } = Orientation.Horizontal;
    // [Parameter] public SliderSize Size { get; set; } = SliderSize.Medium;
    [Parameter] public int? ThumbSize { get; set; }

    [Inject] private IDomHelper Dom { get; set; } = default!;

    private TValue MinProgress => CalculateProgress(Value is null ? default : Value.Min);
    private TValue MaxProgress => CalculateProgress(Value is null ? default : Value.Max);
    private string RailSelector => $"#{Id}>.rail";

    public override Task SetParametersAsync(ParameterView parameters)
    {
        // Check which parameters were set by the user
        if (parameters.TryGetValue<TValue?>(nameof(Min), out _))
            _minHasValue = true;

        if (parameters.TryGetValue<TValue?>(nameof(Max), out _))
            _maxHasValue = true;

        return base.SetParametersAsync(parameters);
    }

    protected override void OnParametersSet()
    {
        _min = _minHasValue ? Min : _minDefault;
        _max = _maxHasValue ? Max : _maxDefault;

        if (ThumbSize != _thumbSize && ThumbSize.HasValue)
        {
            _thumbSize = ThumbSize.Value;
        }
        else if (ThumbSize is null)
        {
            // _thumbSize = Size == SliderSize.Medium ? 20 : 10;
        }

        base.OnParametersSet();
    }

    public override IEnumerable<string> GetClasses()
    {
        foreach (var c in base.GetClasses())
            yield return c;

        yield return "bui-range-slider";
        // yield return Size.ToString().ToLower();
    }

    private TValue CalculateProgress(TValue? v)
    {
        if (v is null)
            return (TValue)(object)0;

        //sbyte
        if (typeof(TValue) == typeof(sbyte) || typeof(TValue) == typeof(sbyte?))
        {
            var value = Convert.ToSByte(v);
            return (TValue)(object)(value * 100 / Convert.ToSByte(_max));
        }
        
        // byte
        if (typeof(TValue) == typeof(byte) || typeof(TValue) == typeof(byte?))
        {
            var value = Convert.ToByte(v);
            return (TValue)(object)(value * 100 / Convert.ToByte(_max));
        }
        
        // short
        if (typeof(TValue) == typeof(short) || typeof(TValue) == typeof(short?))
        {
            var value = Convert.ToInt16(v);
            return (TValue)(object)(value * 100 / Convert.ToInt16(_max));
        }
        
        // ushort
        if (typeof(TValue) == typeof(ushort) || typeof(TValue) == typeof(ushort?))
        {
            var value = Convert.ToUInt16(v);
            return (TValue)(object)(value * 100 / Convert.ToUInt16(_max));
        }
        
        // int
        if (typeof(TValue) == typeof(int) || typeof(TValue) == typeof(int?))
        {
            var value = Convert.ToInt32(v);
            return (TValue)(object)(value * 100 / Convert.ToInt32(_max));
        }
        
        // uint
        if (typeof(TValue) == typeof(uint) || typeof(TValue) == typeof(uint?))
        {
            var value = Convert.ToUInt32(v);
            return (TValue)(object)(value * 100 / Convert.ToUInt32(_max));
        }
        
        // long
        if (typeof(TValue) == typeof(long) || typeof(TValue) == typeof(long?))
        {
            var value = Convert.ToInt64(v);
            return (TValue)(object)(value * 100 / Convert.ToInt64(_max));
        }
        
        // ulong
        if (typeof(TValue) == typeof(ulong) || typeof(TValue) == typeof(ulong?))
        {
            var value = Convert.ToUInt64(v);
            return (TValue)(object)(value * 100 / Convert.ToUInt64(_max));
        }
        
        // float
        if (typeof(TValue) == typeof(float) || typeof(TValue) == typeof(float?))
        {
            var value = Convert.ToSingle(v);
            return (TValue)(object)(value * 100 / Convert.ToSingle(_max));
        }
        
        // double
        if (typeof(TValue) == typeof(double) || typeof(TValue) == typeof(double?))
        {
            var value = Convert.ToDouble(v);
            return (TValue)(object)(value * 100 / Convert.ToDouble(_max));
        }
        
        // decimal
        if (typeof(TValue) == typeof(decimal) || typeof(TValue) == typeof(decimal?))
        {
            var value = Convert.ToDecimal(v);
            return (TValue)(object)(value * 100 / Convert.ToDecimal(_max));
        }

        return (TValue)(object)0;
    }

    private async Task OnPointerDown(PointerEventArgs args)
    {
        _pointerId = args.PointerId;
        await Dom.RegisterPointerMoveHandler(this);
        await Dom.RegisterPointerUpHandler(this);

        await CalculateValueFromPoint(args.ScreenX, args.ScreenY);
    }

    [JSInvokable]
    public async Task OnPointerMove(PointerEventArgs args)
    {
        if (args.PointerId != _pointerId)
            return;
        
        await CalculateValueFromPoint(args.ScreenX, args.ScreenY);
    }

    [JSInvokable]
    public async Task OnPointerUp(PointerEventArgs args)
    {
        if (args.PointerId != _pointerId)
            return;

        await Dom.UnregisterPointerMoveHandler(this);
        await Dom.UnregisterPointerUpHandler(this);
        _pointerId = null;
    }

    private async Task CalculateValueFromPoint(double screenX, double screenY)
    {
        var railRect = await Dom.GetBoundingClientRectAsync(RailSelector);
        if (railRect == null)
            return;

        TValue value;
        // if (Orientation == Orientation.Horizontal)
        // {
            var start = railRect.Left + _thumbSize / 2;
            var size = railRect.Width - _thumbSize;
        
            var relativeX = screenX - start;
            var percentage = relativeX / size;
            percentage = Math.Min(1, Math.Max(0, percentage));
            var newValue = Convert.ToDouble(_min) + percentage * (Convert.ToDouble(_max) - Convert.ToDouble(_min));
            
            value = (TValue)Convert.ChangeType(newValue, typeof(TValue));
        // }
        // else // Vertical
        // {
        //     var start = railRect.Top + _thumbSize / 2;
        //     var size = railRect.Height - _thumbSize;
        //
        //     var relativeY = screenY - start;
        //     var percentage = relativeY / size;
        //     percentage = Math.Min(1, Math.Max(0, percentage));
        //     var newValue = Convert.ToDouble(_min) + percentage * (Convert.ToDouble(_max) - Convert.ToDouble(_min));
        //     
        //     value = (TValue)Convert.ChangeType(newValue, typeof(TValue));
        // }

        var val = Convert.ToDouble(value);
        var minVal = Convert.ToDouble(Value is null ? _min : Value.Min);
        var maxVal = Convert.ToDouble(Value is null ? _max : Value.Max);

        if (Math.Abs(val - minVal) < Math.Abs(val - maxVal))
        {
            // value is near to Min
            Value = new ValueRange<TValue>(value, Value is null ? _max! : Value.Max);
        }
        else
        {
            Value = new ValueRange<TValue>(Value is null ? _min! : Value.Min, value);
        }
        
        await ValueChanged.InvokeAsync(Value);
    }

    private string GetStyle()
    {
        return $"{Style}; --min-progress:{MinProgress}%; --max-progress:{MaxProgress}%; --thumb-size:{_thumbSize}px;";
    }
}