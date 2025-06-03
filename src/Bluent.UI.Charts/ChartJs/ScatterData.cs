namespace Bluent.UI.Charts.ChartJs;

public class ScatterData<TX, TY>
{
    public TX X { get; set; }
    public TY Y { get; set; }

    public ScatterData(TX x, TY y)
    {
        X = x;
        Y = y;
    }

    public static implicit operator ScatterData<TX, TY>((TX x, TY y) data) => new ScatterData<TX, TY>(data.x, data.y);

}
