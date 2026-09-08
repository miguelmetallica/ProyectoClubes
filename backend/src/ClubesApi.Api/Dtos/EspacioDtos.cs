using System.ComponentModel.DataAnnotations;

namespace ClubesApi.Api.Dtos;

public record EspacioRequest(
    [property: Required, MaxLength(200)] string Nombre,
    [property: Required] string Deporte,
    [property: Required] string Modalidad,
    decimal PrecioBase,
    decimal PctSena,
    int VentanaCancelacionHoras);

public record EspacioResponse(
    Guid EspacioId,
    string Nombre,
    string Deporte,
    string Modalidad,
    decimal PrecioBase,
    decimal PctSena,
    int VentanaCancelacionHoras);
