import { defineConfig } from "astro/config";
import react from "@astrojs/react";

// SITE / BASE_PATH let the same build serve a custom domain ("/") or GitHub Pages ("/ai-debt-tracker/").
export default defineConfig({
  site: process.env.SITE ?? "http://localhost:4321",
  base: process.env.BASE_PATH ?? "/",
  integrations: [react()],
});
