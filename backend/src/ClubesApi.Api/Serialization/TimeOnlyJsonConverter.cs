using System.Text.Json;
using System.Text.Json.Serialization;

namespace ClubesApi.Api.Serialization;

/// <summary>
/// El converter por defecto de TimeOnly solo acepta "HH:mm:ss", pero el input nativo
/// type="time" de HTML produce "HH:mm". Este converter acepta ambos formatos al leer,
/// y siempre serializa como "HH:mm" para que los formularios web lo consuman sin conversiones.
/// </summary>
public class TimeOnlyJsonConverter : JsonConverter<TimeOnly>
{
    private const string SerializeFormat = "HH:mm";
    private static readonly string[] AcceptedFormats = ["HH:mm", "HH:mm:ss", "HH:mm:ss.fffffff"];

    public override TimeOnly Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        var value = reader.GetString() ?? throw new JsonException("Se esperaba un string para TimeOnly.");
        if (TimeOnly.TryParseExact(value, AcceptedFormats, out var result))
        {
            return result;
        }

        throw new JsonException($"No se pudo interpretar '{value}' como hora (formatos aceptados: HH:mm, HH:mm:ss).");
    }

    public override void Write(Utf8JsonWriter writer, TimeOnly value, JsonSerializerOptions options)
    {
        writer.WriteStringValue(value.ToString(SerializeFormat));
    }
}
