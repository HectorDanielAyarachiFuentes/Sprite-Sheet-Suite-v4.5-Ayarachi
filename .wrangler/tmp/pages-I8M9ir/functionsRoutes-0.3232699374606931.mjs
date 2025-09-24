import { onRequestPost as __api_log_js_onRequestPost } from "C:\\Users\\Ramoncito\\Documents\\GitHub\\Sprite-Sheet-Suite-v4.5-Ayarachi\\functions\\api\\log.js"

export const routes = [
    {
      routePath: "/api/log",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_log_js_onRequestPost],
    },
  ]