// src/index.js
import { Clerk } from '@clerk/backend';

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
            return handleApiRequest(request, env, ctx);
        }

        // Para todo lo demás, sirve los archivos estáticos usando el fetcher de assets de Pages.
        try {
            return await env.ASSETS.fetch(request);
        } catch (e) {
            // Si el asset no se encuentra, podría ser una ruta de SPA, así que servimos el index.html.
            // Esto permite que el enrutamiento del lado del cliente se haga cargo.
            const notFoundRequest = new Request(new URL('/index.html', request.url));
            return await env.ASSETS.fetch(notFoundRequest);
        }
    },
};