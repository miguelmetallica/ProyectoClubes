export default function ConfiguracionPage() {
  return (
    <div className="space-y-2">
      <h1 className="text-xl font-semibold">Configuración</h1>
      <p className="text-sm text-gray-500">
        Horarios de apertura del complejo. El % de seña y la ventana de cancelación se editan por espacio en la
        sección Espacios, ya que son configurables por tipo de espacio y no valores globales del sistema
        (ver docs/05-reglas-de-negocio.md).
      </p>
    </div>
  );
}
