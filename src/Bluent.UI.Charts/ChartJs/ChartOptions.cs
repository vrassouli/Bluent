using System.Collections.ObjectModel;
using System.Text.Json.Serialization;

namespace Bluent.UI.Charts.ChartJs;

internal class ChartOptions
{
    private Dictionary<string, ChartPlugin>? _plugins;
    private Dictionary<string, ChartScale>? _scales;

    public bool Responsive { get; set; } = true;

    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public ReadOnlyDictionary<string, ChartPlugin>? Plugins => _plugins?.AsReadOnly();

    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public ReadOnlyDictionary<string, ChartScale>? Scales => _scales?.AsReadOnly();

    internal void Add(ChartPlugin plugin)
    {
        if (_plugins is null)
            _plugins = new Dictionary<string, ChartPlugin>();

        _plugins.Add(plugin.Key, plugin);
    }

    internal void Add(ChartScale scale)
    {
        if (_scales is null)
            _scales = new Dictionary<string, ChartScale>();

        _scales.Add(scale.Key, scale);
    }

}
