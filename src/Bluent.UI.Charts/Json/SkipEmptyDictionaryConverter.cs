using System.Text.Json;
using System.Text.Json.Serialization;

namespace Bluent.UI.Charts.Json;

internal class SkipEmptyDictionaryConverter<TKey, TValue> : JsonConverter<Dictionary<TKey, TValue>>
    where TKey : IEquatable<TKey>
{
    public override Dictionary<TKey, TValue>? Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        return JsonSerializer.Deserialize<Dictionary<TKey, TValue>>(ref reader, options);
    }

    public override void Write(Utf8JsonWriter writer, Dictionary<TKey, TValue> value, JsonSerializerOptions options)
    {
        if (value != null && value.Any())
            JsonSerializer.Serialize(writer, value, options);
    }
}