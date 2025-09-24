// index.js
import { Clerk } from '@clerk/backend';
import { getAssetFromKV } from '@cloudflare/kv-asset-handler';

// Esta es la función que maneja las peticiones de la API
const handleApiRequest = async (request, env) => {
  const clerk = Clerk({ secretKey: env.CLERK_SECRET_KEY });
  const authHeader = request.headers.get('Authorization');

  if (!authHeader) {
      return new Response('Authorization header is missing', { status: 401 });
  }

  try {
      const token = authHeader.replace('Bearer ', '');
      const claims = await clerk.verifyToken(token);
      return new Response(JSON.stringify({ success: true, userId: claims.sub }), {
          headers: { 'Content-Type': 'application/json' },
      });
  } catch (error) {
      return new Response('Invalid token', { status: 401 });
  }
};

// Este es el manejador principal que se exporta
export default {
  async fetch(request, env, ctx) {
      const url = new URL(request.url);

      // Si la ruta empieza con /api/, usa la lógica de la API
      if (url.pathname.startsWith('/api/')) {
          return handleApiRequest(request, env);
      }

      // Para todo lo demás, sirve los archivos estáticos de tu sitio
      try {
        // Usa el manejador de assets de KV para servir los archivos estáticos
        // __STATIC_CONTENT es el binding por defecto que Wrangler crea para tu KV namespace de assets.
        return await getAssetFromKV(
          {
            request,
            waitUntil: ctx.waitUntil.bind(ctx),
          },
          {
            ASSET_NAMESPACE: env.__STATIC_CONTENT,
            ASSET_MANIFEST: env.__STATIC_CONTENT_MANIFEST,
          }
        );
      } catch (e) {
        // Si el asset no se encuentra, podría ser una ruta de la SPA, así que servimos index.html
        // Esto permite que el enrutamiento del lado del cliente funcione.
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
                        mapRequestToAsset: (req) => new Request(`${new URL(req.url).origin}/index.html`, req),
                    }
                );

                return new Response(notFoundResponse.body, { ...notFoundResponse, status: 200 });
            } catch (e) {}
        }

        return new Response(e.message || e.toString(), { status: 500 });
      }
  },
};
