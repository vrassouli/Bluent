namespace Bluent.UI.Charts.ChartJs
{
    public class ChartPaddingConfig
    {
        public int? Bottom { get; }
        public int? Left { get; }
        public int? Right { get; }
        public int? Top { get; }

        public ChartPaddingConfig(int? bottom, int? left, int? right, int? top)
        {
            Bottom = bottom;
            Left = left;
            Right = right;
            Top = top;
        }
    }
}