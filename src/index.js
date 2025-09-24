// src/index.js
import { Clerk } from '@clerk/backend';
import { getAssetFromKV } from '@cloudflare/kv-asset-handler';

// Esta función maneja las peticiones a tu API protegida
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
        // Esto es lo que faltaba: usar el getAssetFromKV
        try {
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
            // Si no encuentra el archivo, puede ser una ruta de tu Single Page App,
            // así que sirve el index.html
            if (e.status === 404) {
                 try {
                    let notFoundResponse = await getAssetFromKV(
                        {
                            request,
                            waitUntil: ctx.waitUntil.bind(ctx)
                        },
                        {
                            ASSET_NAMESPACE: env.__STATIC_CONTENT,
                            ASSET_MANIFEST: env.__STATIC_CONTENT_MANIFEST,
                            mapRequestToAsset: (req) => new Request(`${new URL(req.url).origin}/index.html`, req)
                        }
                    );
                    return new Response(notFoundResponse.body, { ...notFoundResponse, status: 200 });
                } catch (e2) {
                    return new Response("Not found", { status: 404 });
                }
            }
            return new Response('An unexpected error occurred', { status: 500 });
        }
    },
};