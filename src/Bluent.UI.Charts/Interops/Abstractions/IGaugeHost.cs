using Bluent.Core;

namespace Bluent.UI.Charts.Interops.Abstractions
{
    internal interface IGaugeHost : IBluentComponent
    {
        Task<string> GetLabelAsync(double value);
    }
}