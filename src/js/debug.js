//Gestion du debug, dans un tableau AXE il y a les réglages globaux, dont le paramètre de debug
window.AXE = {
    NAME: "AXE",
    VERSION: "AXE 2",
    DEBUG: false,
    //AI made
    // true : affiche dans la console la taille du localStorage au chargement (cf. logStorageSize dans storage.js)
    STORAGE_SIZE: false
    //end AI made
};

const noop = () => {};

// Renvoie console.log "bindé" (et non une fonction qui l'enveloppe) : c'est donc le module appelant
// qui exécute console.log, et la console affiche sa vraie position fichier:ligne.
// Le test est fait une seule fois, au chargement du module appelant.
export function createDebug(localDebug) {
    if (!(window.AXE.DEBUG || localDebug)) return noop;
    return console.log.bind(console, `[${window.AXE.VERSION}]`);
}
