using System.Text.Json.Serialization;
using System.Text.Json;
using Humanizer;

namespace Bluent.UI.Common.Json;

public class JsonKebaberizedStringEnumConverter<T> : JsonConverter<T>
{
    private readonly Type _underlyingType;

    public JsonKebaberizedStringEnumConverter() : this(null) { }

    public JsonKebaberizedStringEnumConverter(JsonSerializerOptions? options)
    {
        // cache the underlying type
        _underlyingType = Nullable.GetUnderlyingType(typeof(T)) ?? typeof(T);
    }

    public override bool CanConvert(Type typeToConvert)
    {
        return typeof(T).IsAssignableFrom(typeToConvert);
    }

    public override T Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        var value = reader.GetString();

        if (String.IsNullOrEmpty(value)) 
            return default!;

        // for performance, parse with ignoreCase:false first.
        if (!Enum.TryParse(_underlyingType, value?.Dehumanize(), ignoreCase: false, out var result) && 
            !Enum.TryParse(_underlyingType, value?.Dehumanize(), ignoreCase: true, out result))
        {
            throw new JsonException(
                $"Unable to convert \"{value}\" to Enum \"{_underlyingType}\".");
        }

        return (T)result;
    }

    public override void Write(Utf8JsonWriter writer, T value, JsonSerializerOptions options)
    {
        writer.WriteStringValue(value?.ToString()?.Kebaberize());
    }
}