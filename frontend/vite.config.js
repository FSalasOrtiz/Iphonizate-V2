import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// En GitHub Pages el sitio se sirve desde https://<usuario>.github.io/Iphonizate-V2/,
// así que el build necesita ese prefijo (ojo: el nombre del repo va con
// mayúscula). En local (`npm run dev`) se sirve desde la raíz. Se puede
// sobreescribir con la variable de entorno BASE_PATH.
const base = process.env.BASE_PATH || (process.env.NODE_ENV === "production" ? "/Iphonizate-V2/" : "/");

export default defineConfig({
  base,
  plugins: [react()],
});
