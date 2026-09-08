using System.ComponentModel.DataAnnotations;

namespace ClubesApi.Api.Dtos;

public record ConfiguracionRequest([property: Required] TimeOnly HoraApertura, [property: Required] TimeOnly HoraCierre);

public record ConfiguracionResponse(TimeOnly HoraApertura, TimeOnly HoraCierre);
