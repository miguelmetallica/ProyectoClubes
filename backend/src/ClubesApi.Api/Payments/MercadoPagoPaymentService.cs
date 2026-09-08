using ClubesApi.Domain.Entities;
using MercadoPago.Client.Payment;
using MercadoPago.Client.Preference;
using MercadoPago.Resource.Payment;
using Microsoft.Extensions.Options;

namespace ClubesApi.Api.Payments;

public class MercadoPagoPaymentService
{
    private readonly MercadoPagoOptions _options;

    public MercadoPagoPaymentService(IOptions<MercadoPagoOptions> options)
    {
        _options = options.Value;
    }

    /// <summary>
    /// Crea la preferencia de pago para una reserva. La referencia externa es el ReservaId,
    /// así el webhook puede encontrar la reserva correspondiente al pago notificado.
    /// </summary>
    public async Task<(string PreferenceId, string CheckoutUrl)> CrearPreferenciaAsync(Reserva reserva)
    {
        var client = new PreferenceClient();

        var request = new PreferenceRequest
        {
            ExternalReference = reserva.ReservaId.ToString(),
            NotificationUrl = _options.NotificationUrl,
            Items = new List<PreferenceItemRequest>
            {
                new()
                {
                    Title = $"Reserva {reserva.Espacio.Nombre} · {reserva.Fecha:yyyy-MM-dd} {reserva.HoraInicio}",
                    Quantity = 1,
                    CurrencyId = "ARS",
                    UnitPrice = reserva.PrecioTotal
                }
            }
        };

        var preference = await client.CreateAsync(request);
        return (preference.Id, preference.InitPoint);
    }

    /// <summary>Consulta el estado real de un pago en Mercado Pago a partir del id que llega en el webhook.</summary>
    public async Task<Payment> ObtenerPagoAsync(long paymentId)
    {
        var client = new PaymentClient();
        return await client.GetAsync(paymentId);
    }
}
