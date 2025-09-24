// c:\Users\Ramoncito\Documents\GitHub\Sprite-Sheet-Suite-v4.5-Ayarachi\functions\api\log.js
// Este archivo manejará las solicitudes POST a /api/log en tu dominio de Pages.

export async function onRequestPost(context) {
  try {
    // context.request contiene la solicitud entrante
    const eventData = await context.request.json();

    // Aquí puedes procesar el evento. Para empezar, solo lo imprimimos en la consola.
    // En una aplicación real, lo guardarías en una base de datos (Cloudflare D1, KV, etc.)
    console.log(`[Pages Function] Evento recibido: ${eventData.eventName}`, JSON.stringify(eventData.details));

    // Devuelve una respuesta JSON al cliente
    return new Response(JSON.stringify({ success: true, message: 'Evento registrado' }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (e) {
    console.error('[Pages Function] Error al procesar el evento:', e.message);
    return new Response(JSON.stringify({ success: false, error: 'Cuerpo de la solicitud inválido' }), {
      headers: { 'Content-Type': 'application/json' },
      status: 400,
    });
  }
}
