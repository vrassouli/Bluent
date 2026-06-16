using Bluent.UI.Charts.ChartJs;
using Microsoft.AspNetCore.Components;

namespace Bluent.UI.Charts.Components
{
    public class Colors : ComponentBase, IDisposable
    {
        private ChartColorsPlugin _plugin = default!;

        [CascadingParameter] public ChartJs Chart { get; set; } = default!;
    
        public void Dispose()
        {
            Chart.Remove(_plugin);
        }

        protected override void OnInitialized()
        {
            if (Chart is null)
                throw new InvalidOperationException("Colors should be nested in a Chart component.");

            _plugin = new ChartColorsPlugin(true);
            Chart.Add(_plugin);

            base.OnInitialized();
        }
    }
}