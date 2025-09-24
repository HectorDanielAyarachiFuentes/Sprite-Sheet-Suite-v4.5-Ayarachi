// Maneja:
// GET /api/projects -> Lista los proyectos de un usuario.
// POST /api/projects -> Guarda un nuevo proyecto.

const getUserId = (request) => {
    // En una app real, usarías autenticación. Aquí, confiamos en un ID enviado por el cliente.
    // Esto no es seguro para producción, pero es ideal para un proyecto personal.
    return request.headers.get('x-user-id');
};

/**
 * GET /api/projects
 * Devuelve la lista de metadatos de los proyectos de un usuario.
 */
export async function onRequestGet(context) {
    const { request, env } = context;
    const userId = getUserId(request);

    if (!userId) {
        return new Response(JSON.stringify({ success: false, error: 'User ID no proporcionado' }), { status: 400 });
    }

    try {
        const projectsList = await env.SPRITE_PROJECTS.get(`projects:${userId}`, 'json') || [];
        return new Response(JSON.stringify({ success: true, data: projectsList }), {
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (e) {
        console.error('Error al listar proyectos:', e);
        return new Response(JSON.stringify({ success: false, error: 'Error del servidor al listar proyectos' }), { status: 500 });
    }
}

/**
 * POST /api/projects
 * Guarda el estado completo de un nuevo proyecto.
 */
export async function onRequestPost(context) {
    const { request, env } = context;
    const userId = getUserId(request);

    if (!userId) {
        return new Response(JSON.stringify({ success: false, error: 'User ID no proporcionado' }), { status: 400 });
    }

    try {
        const projectData = await request.json();

        // Validaciones básicas
        if (!projectData.id || !projectData.name || !projectData.state) {
            return new Response(JSON.stringify({ success: false, error: 'Datos del proyecto incompletos' }), { status: 400 });
        }

        const projectId = projectData.id;
        const projectKey = `project:${projectId}`;
        const userProjectsKey = `projects:${userId}`;

        // Obtener la lista actual de proyectos del usuario
        let projectsList = await env.SPRITE_PROJECTS.get(userProjectsKey, 'json') || [];

        // Crear los metadatos para la lista
        const metadata = {
            id: projectId,
            name: projectData.name,
            updatedAt: new Date().toISOString(),
            thumb: projectData.thumb, // Incluir miniatura
        };

        // Comprobar si el proyecto ya existe en la lista para actualizarlo o añadirlo
        const existingIndex = projectsList.findIndex(p => p.id === projectId);
        if (existingIndex > -1) {
            projectsList[existingIndex] = metadata;
        } else {
            projectsList.unshift(metadata); // Añadir al principio
        }

        // Usar `Promise.all` para ejecutar las escrituras en KV en paralelo
        await Promise.all([
            // Guardar el estado completo del proyecto
            env.SPRITE_PROJECTS.put(projectKey, JSON.stringify(projectData.state)),
            // Guardar la lista actualizada de metadatos del usuario
            env.SPRITE_PROJECTS.put(userProjectsKey, JSON.stringify(projectsList))
        ]);

        return new Response(JSON.stringify({ success: true, data: metadata }), {
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (e) {
        console.error('Error al guardar el proyecto:', e);
        if (e instanceof TypeError) {
             return new Response(JSON.stringify({ success: false, error: 'Cuerpo de la solicitud inválido o no es JSON' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
        }
        return new Response(JSON.stringify({ success: false, error: 'Error del servidor al guardar el proyecto' }), { status: 500 });
    }
}