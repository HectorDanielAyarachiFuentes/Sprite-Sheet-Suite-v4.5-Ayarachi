// index.js
import { Clerk } from '@clerk/backend';

export default {
  async fetch(request, env, ctx) {
    // Es una buena práctica envolver el manejador principal en un try...catch
    // para manejar errores inesperados y evitar el error genérico "Worker threw exception".
    try {
      const url = new URL(request.url);

      // Si la petición es para la API, la protegemos con Clerk.
      if (url.pathname.startsWith('/api/')) {
        return await handleApiRequest(request, env);
      }

      // Comprueba si el binding ASSETS para Cloudflare Pages está disponible.
      // Si no lo está, significa que el worker probablemente no está desplegado como una Pages Function.
      if (!env || !env.ASSETS) {
        return new Response('Static asset serving is not configured.', { status: 500 });
      }

      // Para todo lo demás, intentamos servir el archivo estático correspondiente a la petición.
      // 'ASSETS' es el binding que Cloudflare Pages crea automáticamente para servir los archivos de tu proyecto.
      return await env.ASSETS.fetch(request);
    } catch (e) {
      // Este bloque catch se activa cuando un asset no se encuentra (un error 404).
      // Es un patrón común para las Single Page Applications (SPAs) servir el index.html
      // para cualquier ruta que no coincida con un archivo estático, permitiendo que el router del frontend tome el control.
      if (e.message.includes('Not Found')) {
        const url = new URL(request.url);
        // Asegurarse de que env y env.ASSETS existan antes de buscar el fallback.
        if (!env || !env.ASSETS) {
          return new Response('Static asset serving is not configured for fallback.', { status: 500 });
        }
        // Si el archivo no se encontró, servimos el index.html para que la SPA maneje la ruta.
        const notFoundResponse = await env.ASSETS.fetch(new Request(url.origin + '/index.html', request));
        return new Response(notFoundResponse.body, { ...notFoundResponse, status: 200 });
      }
      
      // Para otros errores, devolvemos un error 500.
      console.error("Worker fetch error:", e);
      return new Response('An internal error occurred', { status: 500 });
    }
  },
};

async function handleApiRequest(request, env) {
  try {
    // Validar que la clave secreta esté presente antes de inicializar Clerk.
    if (!env.CLERK_SECRET_KEY) {
      throw new Error('CLERK_SECRET_KEY environment variable not set.');
    }

    // Inicializa Clerk con tu clave secreta
    const clerk = Clerk({ secretKey: env.CLERK_SECRET_KEY });
    const authHeader = request.headers.get('Authorization');

    if (!authHeader) {
      return new Response('Authorization header is missing', { status: 401 });
    }

    // Extrae y verifica el token
    const token = authHeader.replace('Bearer ', '');
    const claims = await clerk.verifyToken(token);

    // ¡Éxito! El usuario está autenticado.
    // claims.sub contiene el ID del usuario.

    // Aquí iría tu lógica para guardar el proyecto en D1, por ejemplo.
    return new Response(JSON.stringify({ success: true, userId: claims.sub }), {
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error("API Request Error:", error);
    // Proporcionar un mensaje de error genérico por seguridad.
    // El error específico se registra en la consola para depuración.
    return new Response('Authentication error', { status: 401 });
  }
}
