namespace Bluent.UI.Charts.ChartJs
{
    public class ChartFontConfig
    {
        public string? Family { get; }
        public int? Size { get; }
        public string? Weight { get; }
        public string? Style { get; }

        public ChartFontConfig(string? family, int? size, string? weight, string? style)
        {
            Family = family;
            Size = size;
            Weight = weight;
            Style = style;
        }
    }
}