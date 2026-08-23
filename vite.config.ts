import { execSync } from "node:child_process";
import { defineConfig } from "vite";

// A short build stamp (git short SHA + build time) so we can confirm which
// build is actually loaded on the phone. Falls back to "dev" without git.
function buildStamp(): string {
  let sha = "dev";
  try {
    sha = execSync("git rev-parse --short HEAD").toString().trim();
  } catch {
    /* not a git checkout */
  }
  const when = new Date().toISOString().slice(0, 16).replace("T", " ");
  return `${sha} · ${when}`;
}

// The game is served from GitHub Pages at
// https://<user>.github.io/CardsOfLife/ , so asset URLs need that base path.
// Locally (dev/preview) we want "/", so only apply the base for the build.
export default defineConfig(({ command }) => ({
  base: command === "build" ? "/CardsOfLife/" : "/",
  define: {
    __BUILD__: JSON.stringify(buildStamp()),
  },
}));
