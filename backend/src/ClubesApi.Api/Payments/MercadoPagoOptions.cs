namespace ClubesApi.Api.Payments;

public class MercadoPagoOptions
{
    public const string SectionName = "MercadoPago";

    public string AccessToken { get; set; } = string.Empty;

    /// <summary>URL pública donde Mercado Pago notifica los cambios de estado del pago.</summary>
    public string NotificationUrl { get; set; } = string.Empty;
}
