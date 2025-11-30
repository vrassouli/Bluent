namespace Bluent.UI.Components;

public record ValueRange<TValue>
{
    public TValue Min { get; set; }
    public TValue Max { get; set; }

    public ValueRange()
    {
        Min = default(TValue)!;
        Max = default(TValue)!;
    }
    
    public ValueRange(TValue min, TValue max)
    {
        Min = min;
        Max = max;
    }
}