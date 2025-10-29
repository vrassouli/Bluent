using Bluent.UI.Common.Json;
using System.Text.Json.Serialization;

namespace Bluent.UI.Components;

public record PopoverSettings
{
    private PopoverSettings()
    {
        
    }
    public PopoverSettings(string triggerId, Placement placement, int offset, int padding)
    {
        TriggerId = triggerId;
        Placement = placement;
        Offset = offset;
        Padding = padding;
    }

    public string TriggerId { get; set; } = default!;
    
    public string[]? TriggerEvents { get; set; } 
    
    public string[]? HideEvents { get; set; } 

    [JsonConverter(typeof(JsonKebaberizedStringEnumConverter<Placement>))] 
    public Placement Placement { get; set; }

    public int Offset { get; set; } = 6;
    public int Padding { get; set; } = 5;
    public bool SameWidth { get; set; }
}