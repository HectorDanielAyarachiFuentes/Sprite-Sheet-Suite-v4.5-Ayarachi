// c:\Users\Ramoncito\Documents\GitHub\Sprite-Sheet-Suite-v4.5-Ayarachi\functions\api\log.js
// Este archivo manejará las solicitudes POST a /api/log en tu dominio de Pages.

export async function onRequestPost(context) {
  try {
    // context.request contiene la solicitud entrante
    // --- MEJORA: Validar que el cuerpo de la petición exista ---
    if (!context.request.body) {
      return new Response(JSON.stringify({ success: false, error: 'No se proporcionó cuerpo en la solicitud' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }
    const eventData = await context.request.json(); // Esto puede fallar si el cuerpo no es JSON

    // Aquí puedes procesar el evento. Para empezar, solo lo imprimimos en la consola.
    // En una aplicación real, lo guardarías en una base de datos (Cloudflare D1, KV, etc.)
    console.log(`[Pages Function] Evento recibido: ${eventData.eventName}`, JSON.stringify(eventData.details));

    // Devuelve una respuesta JSON al cliente
    return new Response(JSON.stringify({ success: true, message: 'Evento registrado' }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (e) {
    // --- MEJORA: Manejo de errores más específico ---
    console.error('[Pages Function] Error al procesar el evento:', e);
    const errorMessage = e instanceof SyntaxError ? 'Cuerpo de la solicitud inválido o no es JSON.' : 'Error interno del servidor.';
    return new Response(JSON.stringify({ success: false, error: errorMessage, detail: e.message }), {
      headers: { 'Content-Type': 'application/json' },
      status: 400,
    });
  }
}