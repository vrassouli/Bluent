using Bluent.UI.Common.Json;
using System.Text.Json.Serialization;

namespace Bluent.UI.Components;

public record PopoverSettings
{
    private PopoverSettings()
    {
        
    }
    public PopoverSettings(string triggerId, Placement placement)
    {
        TriggerId = triggerId;
        Placement = placement;
    }

    public string TriggerId { get; set; } = default!;

    [JsonConverter(typeof(JsonKebaberizedStringEnumConverter<Placement>))] 
    public Placement Placement { get; set; }
}