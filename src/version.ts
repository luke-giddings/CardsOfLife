// On-screen build label. Bump these when it helps to tell builds apart on the
// phone; the git SHA + time are appended automatically (see vite.config.ts).
export const APP_VERSION = "0.1";
export const BUILD_DESC = "fix: cards went blank when a vital was about to run out — the easy-mode preview crashed trying to render a '−' for a vital the card didn't touch (only the death skull should show there). Low-health turns display again";
