// index.js
export default {
  async fetch(request, env) {
    // Esto le dice al Worker que sirva los archivos de tu proyecto
    // (tu index.html, CSS, otras carpetas, etc.)
    return env.ASSETS.fetch(request);
  },
};
