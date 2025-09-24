import { onRequestPost as __api_log_js_onRequestPost } from "C:\\Users\\Ramoncito\\Documents\\GitHub\\Sprite-Sheet-Suite-v4.5-Ayarachi\\functions\\api\\log.js"
import { onRequestGet as __api_projects_index_js_onRequestGet } from "C:\\Users\\Ramoncito\\Documents\\GitHub\\Sprite-Sheet-Suite-v4.5-Ayarachi\\functions\\api\\projects\\index.js"
import { onRequestPost as __api_projects_index_js_onRequestPost } from "C:\\Users\\Ramoncito\\Documents\\GitHub\\Sprite-Sheet-Suite-v4.5-Ayarachi\\functions\\api\\projects\\index.js"

export const routes = [
    {
      routePath: "/api/log",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_log_js_onRequestPost],
    },
  {
      routePath: "/api/projects",
      mountPath: "/api/projects",
      method: "GET",
      middlewares: [],
      modules: [__api_projects_index_js_onRequestGet],
    },
  {
      routePath: "/api/projects",
      mountPath: "/api/projects",
      method: "POST",
      middlewares: [],
      modules: [__api_projects_index_js_onRequestPost],
    },
  ]