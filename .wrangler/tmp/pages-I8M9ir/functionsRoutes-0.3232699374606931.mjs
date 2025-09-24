import { onRequestPost as __log_js_onRequestPost } from "C:\\Users\\Ramoncito\\Documents\\GitHub\\Sprite-Sheet-Suite-v4.5-Ayarachi\\functions\\log.js"

export const routes = [
    {
      routePath: "/log",
      mountPath: "/",
      method: "POST",
      middlewares: [],
      modules: [__log_js_onRequestPost],
    },
  ]