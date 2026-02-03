using System.Globalization;
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
    private readonly TValue? _minDefault;
    private readonly TValue? _maxDefault;
    private bool _maxHasValue;
    private bool _minHasValue;
    private long? _pointerId;

    [Parameter] public TValue? Min { get; set; }
    [Parameter] public TValue? Max { get; set; }
    [Parameter] public ValueRange<TValue>? Value { get; set; }
    [Parameter] public EventCallback<ValueRange<TValue>?> ValueChanged { get; set; }
    [Parameter] public int? ThumbSize { get; set; }

    [Inject] private IDomHelper Dom { get; set; } = default!;

    private TValue MinProgress => CalculateProgress(Value is null ? Min : Value.Min);
    private TValue MaxProgress => CalculateProgress(Value is null ? Max : Value.Max);
    private string RailSelector => $"#{Id}>.rail";
    public RangeSlider()
    {
        #region parameters default depending on TValue

        //sbyte
        if (typeof(TValue) == typeof(sbyte) || typeof(TValue) == typeof(sbyte?))
        {
            _minDefault = (TValue)(object)(sbyte)0;
            _maxDefault = (TValue)(object)(sbyte)100;
        }
        // byte
        else if (typeof(TValue) == typeof(byte) || typeof(TValue) == typeof(byte?))
        {
            _minDefault = (TValue)(object)(byte)0;
            _maxDefault = (TValue)(object)(byte)100;
        }
        // short
        else if (typeof(TValue) == typeof(short) || typeof(TValue) == typeof(short?))
        {
            _minDefault = (TValue)(object)(short)0;
            _maxDefault = (TValue)(object)(short)100;
        }
        // ushort
        else if (typeof(TValue) == typeof(ushort) || typeof(TValue) == typeof(ushort?))
        {
            _minDefault = (TValue)(object)(ushort)0;
            _maxDefault = (TValue)(object)(ushort)100;
        }
        // int
        else if (typeof(TValue) == typeof(int) || typeof(TValue) == typeof(int?))
        {
            _minDefault = (TValue)(object)(int)0;
            _maxDefault = (TValue)(object)(int)100;
        }
        // uint
        else if (typeof(TValue) == typeof(uint) || typeof(TValue) == typeof(uint?))
        {
            _minDefault = (TValue)(object)(uint)0;
            _maxDefault = (TValue)(object)(uint)100;
        }
        // long
        else if (typeof(TValue) == typeof(long) || typeof(TValue) == typeof(long?))
        {
            _minDefault = (TValue)(object)(long)0;
            _maxDefault = (TValue)(object)(long)100;
        }
        // ulong
        else if (typeof(TValue) == typeof(ulong) || typeof(TValue) == typeof(ulong?))
        {
            _minDefault = (TValue)(object)(ulong)0;
            _maxDefault = (TValue)(object)(ulong)100;
        }
        // float
        else if (typeof(TValue) == typeof(float) || typeof(TValue) == typeof(float?))
        {
            _minDefault = (TValue)(object)(float)0;
            _maxDefault = (TValue)(object)(float)100;
        }
        // double
        else if (typeof(TValue) == typeof(double) || typeof(TValue) == typeof(double?))
        {
            _minDefault = (TValue)(object)(double)0;
            _maxDefault = (TValue)(object)(double)100;
        }
        // decimal
        else if (typeof(TValue) == typeof(decimal) || typeof(TValue) == typeof(decimal?))
        {
            _minDefault = (TValue)(object)(decimal)0;
            _maxDefault = (TValue)(object)(decimal)100;
        }

        #endregion parameters default depending on T
    }
    
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
        
        if (Convert.ToDecimal(_max) <= Convert.ToDecimal(_min))
            throw new InvalidOperationException($"The '{nameof(Max)}' parameter must be greater than the '{nameof(Min)}' parameter.");

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
    }

    private TValue CalculateProgress(TValue? v)
    {
        if (v is null)
            return _min ?? _minDefault ?? (TValue)(object)0;

        //sbyte
        if (typeof(TValue) == typeof(sbyte) || typeof(TValue) == typeof(sbyte?))
        {
            var shift = 0 - Convert.ToSByte(_min);
            var value = Convert.ToSByte(v) + shift;
            return (TValue)(object)(value * 100 / (Convert.ToSByte(_max) + shift));
        }
        
        // byte
        if (typeof(TValue) == typeof(byte) || typeof(TValue) == typeof(byte?))
        {
            var shift = 0 - Convert.ToByte(_min);
            var value = Convert.ToByte(v) + shift;
            return (TValue)(object)(value * 100 / (Convert.ToByte(_max) + shift));
        }
        
        // short
        if (typeof(TValue) == typeof(short) || typeof(TValue) == typeof(short?))
        {
            var shift = 0 - Convert.ToInt16(_min);
            var value = Convert.ToInt16(v) + shift;
            return (TValue)(object)(value * 100 / (Convert.ToInt16(_max) + shift));
        }

        // ushort
        if (typeof(TValue) == typeof(ushort) || typeof(TValue) == typeof(ushort?))
        {
            var shift = 0 - Convert.ToUInt16(_min);
            var value = Convert.ToUInt16(v) + shift;
            return (TValue)(object)(value * 100 / (Convert.ToUInt16(_max) + shift));
        }

        // int
        if (typeof(TValue) == typeof(int) || typeof(TValue) == typeof(int?))
        {
            var shift = 0 - Convert.ToInt32(_min);
            var value = Convert.ToInt32(v) + shift;
            return (TValue)(object)(value * 100 / (Convert.ToInt32(_max) + shift));
        }

        // uint
        if (typeof(TValue) == typeof(uint) || typeof(TValue) == typeof(uint?))
        {
            var shift = 0 - Convert.ToUInt32(_min);
            var value = Convert.ToUInt32(v) + shift;
            return (TValue)(object)(value * 100 / (Convert.ToUInt32(_max) + shift));
        }

        // long
        if (typeof(TValue) == typeof(long) || typeof(TValue) == typeof(long?))
        {
            var shift = 0 - Convert.ToInt64(_min);
            var value = Convert.ToInt64(v) + shift;
            return (TValue)(object)(value * 100 / (Convert.ToInt64(_max) + shift));
        }

        // ulong
        if (typeof(TValue) == typeof(ulong) || typeof(TValue) == typeof(ulong?))
        {
            var shift = 0 - Convert.ToUInt64(_min);
            var value = Convert.ToUInt64(v) + shift;
            return (TValue)(object)(value * 100 / (Convert.ToUInt64(_max) + shift));
        }

        // float
        if (typeof(TValue) == typeof(float) || typeof(TValue) == typeof(float?))
        {
            var shift = 0 - Convert.ToSingle(_min);
            var value = Convert.ToSingle(v) + shift;
            return (TValue)(object)(value * 100 / (Convert.ToSingle(_max) + shift));
        }

        // double
        if (typeof(TValue) == typeof(double) || typeof(TValue) == typeof(double?))
        {
            var shift = 0 - Convert.ToDouble(_min);
            var value = Convert.ToDouble(v) + shift;
            return (TValue)(object)(value * 100 / (Convert.ToDouble(_max) + shift));
        }

        // decimal
        if (typeof(TValue) == typeof(decimal) || typeof(TValue) == typeof(decimal?))
        {
            var shift = 0 - Convert.ToDecimal(_min);
            var value = Convert.ToDecimal(v) + shift;
            return (TValue)(object)(value * 100 / (Convert.ToDecimal(_max) + shift));
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