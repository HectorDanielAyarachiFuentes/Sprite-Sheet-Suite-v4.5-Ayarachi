import { getAssetFromKV, mapRequestToAsset, serveSinglePageApp } from '@cloudflare/kv-asset-handler';

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    try {
      // La opción mapRequestToAsset se encarga de reescribir las rutas de la SPA.
      // Si la ruta no parece un archivo estático (no tiene extensión), la redirige a index.html.
      const options = {
        ASSET_NAMESPACE: env.__STATIC_CONTENT,
        ASSET_MANIFEST: env.__STATIC_CONTENT_MANIFEST,
        // Usar serveSinglePageApp es la forma más idiomática para una SPA.
        // Esto reescribe la solicitud a /index.html para rutas que no son archivos.
        mapRequestToAsset: serveSinglePageApp,
      };

      // Hacemos la llamada a getAssetFromKV una sola vez con las opciones correctas.
      return await getAssetFromKV(
        {
          request,
          waitUntil: ctx.waitUntil.bind(ctx),
        },
        options
      );
    } catch (e) {
      // Si getAssetFromKV falla incluso después de intentar buscar index.html,
      // puede que el archivo realmente no exista.
      // Se intenta obtener el archivo 404.html si existe.
      if (e.status === 404) {
        try {
          let notFoundResponse = await getAssetFromKV(
            {
              request,
              waitUntil: ctx.waitUntil.bind(ctx),
            },
            {
              ASSET_NAMESPACE: env.__STATIC_CONTENT,
              ASSET_MANIFEST: env.__STATIC_CONTENT_MANIFEST,
              // Buscamos una página 404 personalizada
              mapRequestToAsset: (req) => new Request(`${new URL(req.url).origin}/404.html`, req),
            }
          );
          
          return new Response(notFoundResponse.body, { ...notFoundResponse, status: 404 });
        } catch (e) {
            return new Response('Not Found', { status: 404 });
        }
      }

      // Para otros errores (como problemas con KV), devuelve un 500.
      return new Response(e.message || e.toString(), { status: e.status || 500 });
    }
  },
};