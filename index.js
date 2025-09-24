// index.js
import { getAssetFromKV, mapRequestToAsset } from '@cloudflare/kv-asset-handler';

export default {
  async fetch(request, env, ctx) {
      const url = new URL(request.url);

      // This part is for API routes. If you are using Clerk for authentication,
      // you would uncomment this and the related imports.
      /*
      if (url.pathname.startsWith('/api/')) {
        // Lazy load Clerk to avoid loading it for every asset request.
        const { Clerk } = await import('@clerk/backend');
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
      }
      */

      // For everything else, serve the static assets.
      try {
        // Use the KV asset handler to serve static files.
        // __STATIC_CONTENT is the default binding Wrangler creates for your assets KV namespace.
        return await getAssetFromKV(
          {
            request,
            waitUntil: ctx.waitUntil.bind(ctx),
          },
          {
            // This is the binding to the namespace where your static assets are stored.
            ASSET_NAMESPACE: env.__STATIC_CONTENT,
            // This is the manifest file that maps requests to asset keys.
            ASSET_MANIFEST: env.__STATIC_CONTENT_MANIFEST,
          }
        );
      } catch (e) {
        // If the asset is not found, it might be a route for your Single Page App (SPA).
        // In that case, we serve the index.html file.
        if (e.status === 404) {
            try {
                // This rewrites the request to '/index.html' to serve your app's entry point.
                let notFoundResponse = await getAssetFromKV(
                    {
                        request,
                        waitUntil: ctx.waitUntil.bind(ctx),
                    },
                    {
                        ASSET_NAMESPACE: env.__STATIC_CONTENT,
                        ASSET_MANIFEST: env.__STATIC_CONTENT_MANIFEST,
                        // This function is crucial for SPA routing.
                        mapRequestToAsset: (req) => new Request(`${new URL(req.url).origin}/index.html`, req)
                    }
                );

                return new Response(notFoundResponse.body, { ...notFoundResponse, status: 200 });
            } catch (e) {
                // If index.html is not found, return a 500 error.
            }
        }

        return new Response(e.message || e.toString(), { status: 500 });
      }
  },
};
