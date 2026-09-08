using System.ComponentModel.DataAnnotations;

namespace ClubesApi.Api.Dtos;

public record ConfiguracionRequest([Required] TimeOnly HoraApertura, [Required] TimeOnly HoraCierre);

public record ConfiguracionResponse(TimeOnly HoraApertura, TimeOnly HoraCierre);
