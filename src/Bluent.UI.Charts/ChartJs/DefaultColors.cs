namespace Bluent.UI.Charts.ChartJs
{
    public static class DefaultColors
    {
        public static ChartJsColor Blue => new ChartJsColor("#36a2eb");
        public static ChartJsColor Red => new ChartJsColor("#ff6384");
        public static ChartJsColor Green => new ChartJsColor("#4bc0c0");
        public static ChartJsColor Orange => new ChartJsColor("#ff9f40");
        public static ChartJsColor Purple => new ChartJsColor("#9966ff");
        public static ChartJsColor Yellow => new ChartJsColor("#ffcd56");
        public static ChartJsColor Gray => new ChartJsColor("#c9cbcf");
    }

    public class ChartJsColor
    {
        private readonly string _color;

        internal ChartJsColor(string color)
        {
            _color = color;
        }

        public ChartJsColor Opacity(byte opacity)
        {
            var colorValue = _color.TrimStart('#');

            if (colorValue.Length == 8)
                colorValue = colorValue.Substring(2, 6);

            var colorCode = $"#{colorValue}{opacity:X}";

            return new ChartJsColor(colorCode);
        }

        public static implicit operator string(ChartJsColor c) => c._color;
    }
}
