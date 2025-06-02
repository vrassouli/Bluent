using Bluent.UI.Charts.ChartJs;
using Bluent.UI.Components;
using System.Data;

namespace Bluent.UI.Charts.Components;

public class LineChart : Chart
{

    internal override ChartConfig BuildConfig()
    {
        return new ChartConfig("line", BuildChartData(BuildDatasets()), BuildChartOptions());
    }
}
