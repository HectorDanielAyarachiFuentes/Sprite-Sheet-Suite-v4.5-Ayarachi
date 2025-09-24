// --- Módulo de Gestión de la Nube ---
// Encapsula la lógica para guardar y cargar proyectos desde la API en la nube.

import { AppState } from './2_appState.js';
import { HistoryManager } from './3_historyManager.js';
import { UIManager } from './4_uiManager.js';
import { DOM } from './1_dom.js';

const CloudManager = (() => {
    let userId = null;

    const getUserId = () => {
        if (userId) return userId;
        let storedId = localStorage.getItem('spriteSheetUserId');
        if (!storedId) {
            storedId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
            localStorage.setItem('spriteSheetUserId', storedId);
        }
        userId = storedId;
        return userId;
    };

    const getApiHeaders = () => ({
        'Content-Type': 'application/json',
        'x-user-id': getUserId(),
    });

    const generateThumbnail = () => {
        const thumbCanvas = document.createElement('canvas');
        const thumbCtx = thumbCanvas.getContext('2d');
        const thumbSize = 64; // Un poco más grande para mejor calidad
        thumbCanvas.width = thumbSize;
        thumbCanvas.height = thumbSize;

        if (DOM.imageDisplay.naturalWidth > 0) {
            thumbCtx.drawImage(DOM.imageDisplay, 0, 0, DOM.imageDisplay.naturalWidth, DOM.imageDisplay.naturalHeight, 0, 0, thumbSize, thumbSize);
        } else {
            thumbCtx.fillStyle = '#333';
            thumbCtx.fillRect(0, 0, thumbSize, thumbSize);
        }
        return thumbCanvas.toDataURL('image/jpeg', 0.8); // Usar JPEG para un tamaño menor
    };

    return {
        init() {
            getUserId(); // Asegurarse de que el ID de usuario exista al iniciar
            DOM.saveToCloudButton.addEventListener('click', () => this.saveProject());
            DOM.cloudProjectsList.addEventListener('click', (e) => {
                const li = e.target.closest('li');
                if (!li) return;
                const projectId = li.dataset.projectId;

                if (e.target.classList.contains('delete-cloud-btn')) {
                    e.stopPropagation();
                    this.deleteProject(projectId, li.querySelector('.cloud-project-name').textContent);
                } else {
                    this.loadProject(projectId);
                }
            });
        },

        async saveProject() {
            if (!DOM.imageDisplay.src || DOM.imageDisplay.src.startsWith('http')) {
                UIManager.showToast('Carga una imagen primero para poder guardarla.', 'warning');
                return;
            }

            const projectName = prompt('Introduce un nombre para tu proyecto en la nube:', AppState.currentFileName);
            if (!projectName) return;

            UIManager.showLoader('Guardando en la nube...');

            const projectId = AppState.cloudProjectId || `proj_${Date.now()}`;

            const fullState = {
                imageSrc: DOM.imageDisplay.src,
                fileName: projectName,
                frames: AppState.frames,
                clips: AppState.clips,
                activeClipId: AppState.activeClipId,
                subFrameOffsets: AppState.subFrameOffsets,
                ...HistoryManager.getHistoryState(),
                cloudProjectId: projectId, // Guardar el ID en el estado
            };

            try {
                const response = await fetch('/api/projects', {
                    method: 'POST',
                    headers: getApiHeaders(),
                    body: JSON.stringify({
                        id: projectId,
                        name: projectName,
                        thumb: generateThumbnail(),
                        state: fullState,
                    }),
                });

                const result = await response.json();
                if (!response.ok || !result.success) {
                    throw new Error(result.error || 'Respuesta del servidor no fue exitosa.');
                }

                AppState.cloudProjectId = projectId; // Actualizar el ID en el estado actual
                AppState.currentFileName = projectName; // Actualizar el nombre del archivo
                UIManager.showToast(`Proyecto "${projectName}" guardado en la nube.`, 'success');
                this.loadProjectList(); // Refrescar la lista de proyectos

            } catch (error) {
                console.error('Error al guardar en la nube:', error);
                UIManager.showToast('No se pudo guardar el proyecto en la nube.', 'danger');
            } finally {
                UIManager.hideLoader();
            }
        },

        async loadProject(projectId) {
            if (!projectId) return;
            UIManager.showLoader('Cargando desde la nube...');
            try {
                const response = await fetch(`/api/projects/${projectId}`, {
                    headers: getApiHeaders(),
                });
                const result = await response.json();
                if (!response.ok || !result.success) {
                    throw new Error(result.error || 'No se pudo cargar el proyecto.');
                }

                // Usamos un evento global para desacoplar el CloudManager del App principal.
                // App.js ya está escuchando este evento.
                window.dispatchEvent(new CustomEvent('loadProjectState', { detail: result.data }));

            } catch (error) {
                console.error('Error al cargar el proyecto desde la nube:', error);
                UIManager.showToast(error.message, 'danger');
            } finally {
                UIManager.hideLoader();
            }
        },

        async deleteProject(projectId, projectName) {
            if (!projectId) return;
            if (!confirm(`¿Estás seguro de que quieres eliminar "${projectName}" de la nube? Esta acción no se puede deshacer.`)) {
                return;
            }
            UIManager.showLoader('Eliminando de la nube...');
            try {
                const response = await fetch(`/api/projects/${projectId}`, {
                    method: 'DELETE',
                    headers: getApiHeaders(),
                });
                const result = await response.json();
                if (!response.ok || !result.success) throw new Error(result.error);

                UIManager.showToast(`Proyecto "${projectName}" eliminado.`, 'success');
                this.loadProjectList(); // Refrescar la lista
            } catch (error) {
                console.error('Error al eliminar el proyecto:', error);
                UIManager.showToast('No se pudo eliminar el proyecto.', 'danger');
            } finally {
                UIManager.hideLoader();
            }
        },

        async loadProjectList() {
            DOM.cloudProjectsList.innerHTML = '<li>Cargando proyectos...</li>';
            try {
                const response = await fetch('/api/projects', { headers: getApiHeaders() });
                const result = await response.json();
                if (!response.ok || !result.success) throw new Error(result.error);

                DOM.cloudProjectsList.innerHTML = '';
                if (result.data.length === 0) {
                    DOM.cloudProjectsList.innerHTML = '<li class="no-projects">No hay proyectos en la nube.</li>';
                    return;
                }

                result.data.forEach(proj => {
                    const li = document.createElement('li');
                    li.dataset.projectId = proj.id;
                    li.innerHTML = `<img src="${proj.thumb}" class="history-thumb" alt="thumb"><span class="cloud-project-name">${proj.name}</span><button class="delete-cloud-btn" title="Eliminar de la nube">☁️✖</button>`;
                    DOM.cloudProjectsList.appendChild(li);
                });
            } catch (error) {
                console.error('Error al cargar la lista de proyectos:', error);
                DOM.cloudProjectsList.innerHTML = '<li class="no-projects">Error al cargar proyectos.</li>';
            }
        },
    };
})();

export { CloudManager };