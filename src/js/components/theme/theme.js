//AI made
// Logique du thème clair/sombre (aucun accès au DOM ici).

import { createDebug } from "../../debug.js";

const LOCAL_DEBUG = false;
const debug = createDebug(LOCAL_DEBUG);

debug("Chargement theme.js");



//AI made
export function getNextTheme(currentTheme) {
    return currentTheme === "dark" ? "light" : "dark";
}
