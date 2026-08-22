import { defineConfig } from "vite";

// The game is served from GitHub Pages at
// https://<user>.github.io/CardsOfLife/ , so asset URLs need that base path.
// Locally (dev/preview) we want "/", so only apply the base for the build.
export default defineConfig(({ command }) => ({
  base: command === "build" ? "/CardsOfLife/" : "/",
}));
