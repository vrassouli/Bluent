namespace Bluent.UI.Common.Regex;

public abstract class Quantifier
{
    public string Value { get; protected set; }
    protected Quantifier(string value)
    {
        Value = value;
    }

    public abstract int Length { get; }
}

public sealed class OneOrMoreQuantifier : Quantifier
{
    public OneOrMoreQuantifier() : base("+")
    {

    }

    public override int Length => 1;
}

public sealed class ZeroOrMoreQuantifier : Quantifier
{
    public ZeroOrMoreQuantifier() : base("*")
    {

    }
    public override int Length => 1;
}

public sealed class OptionalQuantifier : Quantifier
{
    public OptionalQuantifier() : base("?")
    {

    }
    public override int Length => 1;
}

public sealed class RangeQuantifier : Quantifier
{
    public RangeQuantifier(int min, int? max = null) : base(ToString(min, max))
    {
        Min = min;
        Max = max;
    }

    public int Min { get; }
    public int? Max { get; }

    public override int Length => ToString(Min, Max).Length + 2;

    private static string ToString(int min, int? max)
    {
        if (min == max)
            return $"{min}";

        if (max != null)
            return $"{min},{max}";

        return $"{min},";
    }

    public static RangeQuantifier? TryParse(string value)
    {
        var isRange = value.IndexOf(',') > -1;

        if (!isRange)
        {
            if (int.TryParse(value, out var min))
                return new RangeQuantifier(min, min);
        }
        else
        {
            var splits = value.Split(',');

            if (string.IsNullOrEmpty(splits[1]) && int.TryParse(splits[0], out var min))
                return new RangeQuantifier(min);
            else if (int.TryParse(splits[0], out min) && int.TryParse(splits[1], out var max))
                return new RangeQuantifier(min, max);

        }

        return null;
    }
}