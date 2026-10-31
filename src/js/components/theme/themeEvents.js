//AI made
// Branche le bouton #themeToggle : bascule, sauvegarde et rafraîchit ce qui ne suit pas le CSS seul.

import { createDebug } from "../../debug.js";

const LOCAL_DEBUG = false;
const debug = createDebug(LOCAL_DEBUG);

debug("Chargement themeEvents.js");



import { loadTheme, saveTheme } from "./../../services/storage/storageTheme.js";
import { getNextTheme } from "./theme.js";
import { themeToggleButton, getCurrentTheme, applyTheme } from "./themeUI.js";
import { updateWeeklyChartColors } from "./../dashboard/dashboardUI.js";



//AI made
export function setupThemeToggle() {

    // le script inline du <head> a déjà posé data-theme (évite le flash clair) : on resynchronise l'état du bouton
    applyTheme(loadTheme());

    if (!themeToggleButton) return;

    themeToggleButton.addEventListener("click", () => {
        const nextTheme = getNextTheme(getCurrentTheme());

        applyTheme(nextTheme);
        saveTheme(nextTheme);

        // Chart.js a lu les couleurs CSS à sa création : il faut les lui redonner
        updateWeeklyChartColors();
    });

}
