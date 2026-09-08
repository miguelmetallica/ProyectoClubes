using System.ComponentModel.DataAnnotations;

namespace ClubesApi.Api.Dtos;

public record EspacioRequest(
    [Required, MaxLength(200)] string Nombre,
    [Required] string Deporte,
    [Required] string Modalidad,
    decimal PrecioBase,
    decimal PctSena,
    int VentanaCancelacionHoras,
    int VencimientoValidacionHoras);

public record EspacioResponse(
    Guid EspacioId,
    string Nombre,
    string Deporte,
    string Modalidad,
    decimal PrecioBase,
    decimal PctSena,
    int VentanaCancelacionHoras,
    int VencimientoValidacionHoras);
