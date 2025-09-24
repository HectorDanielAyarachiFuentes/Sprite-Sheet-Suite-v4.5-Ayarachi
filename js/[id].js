// Maneja:
// GET /api/projects/[id] -> Carga un proyecto específico.
// DELETE /api/projects/[id] -> Borra un proyecto específico.

const getUserId = (request) => {
    return request.headers.get('x-user-id');
};

/**
 * GET /api/projects/[id]
 * Devuelve el estado completo de un proyecto.
 */
export async function onRequestGet(context) {
    const { request, env, params } = context;
    const projectId = params.id;

    try {
        const projectState = await env.SPRITE_PROJECTS.get(`project:${projectId}`, 'json');

        if (!projectState) {
            return new Response(JSON.stringify({ success: false, error: 'Proyecto no encontrado' }), { status: 404 });
        }

        return new Response(JSON.stringify({ success: true, data: projectState }), {
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (e) {
        console.error(`Error al cargar el proyecto ${projectId}:`, e);
        return new Response(JSON.stringify({ success: false, error: 'Error del servidor al cargar el proyecto' }), { status: 500 });
    }
}

/**
 * DELETE /api/projects/[id]
 * Borra un proyecto y su referencia en la lista del usuario.
 */
export async function onRequestDelete(context) {
    const { request, env, params } = context;
    const userId = getUserId(request);
    const projectId = params.id;

    if (!userId) {
        return new Response(JSON.stringify({ success: false, error: 'User ID no proporcionado' }), { status: 400 });
    }

    try {
        const userProjectsKey = `projects:${userId}`;
        const projectKey = `project:${projectId}`;

        // Actualizar la lista de metadatos del usuario
        let projectsList = await env.SPRITE_PROJECTS.get(userProjectsKey, 'json') || [];
        const updatedList = projectsList.filter(p => p.id !== projectId);

        // Ejecutar borrado y actualización en paralelo
        await Promise.all([
            env.SPRITE_PROJECTS.delete(projectKey),
            env.SPRITE_PROJECTS.put(userProjectsKey, JSON.stringify(updatedList))
        ]);

        return new Response(JSON.stringify({ success: true, message: 'Proyecto eliminado' }), { status: 200 });
    } catch (e) {
        console.error(`Error al eliminar el proyecto ${projectId}:`, e);
        return new Response(JSON.stringify({ success: false, error: 'Error del servidor al eliminar el proyecto' }), { status: 500 });
    }
}