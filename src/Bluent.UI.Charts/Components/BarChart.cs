using Bluent.UI.Charts.ChartJs;
using Bluent.UI.Components;
using Microsoft.AspNetCore.Components;

namespace Bluent.UI.Charts.Components;

public class BarChart : Chart
{

    protected override ChartConfig BuildConfig()
    {
        var datasets = DatasetsList.Select(x => x.ToDataset());

        BarChartOptions options = new BarChartOptions();

        foreach (var plugin in PluginsList)
            options.Plugins.Add(plugin.Key, plugin);

        return new BarChartConfig(new BarChartData(datasets)
        {
            Labels = Labels,
            XLabels = XLabels,
            YLabels = YLabels,
        }, options);
    }
}
