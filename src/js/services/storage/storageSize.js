import { createDebug } from "../../debug.js";

const LOCAL_DEBUG = false;
const debug = createDebug(LOCAL_DEBUG);

debug("Chargement storageSize.js");


//AI made
//--------------------
//taille du localStorage
//--------------------
// Affiche la taille de chaque clé et le total, si AXE.STORAGE_SIZE est à true.
// localStorage stocke en UTF-16 : 2 octets par caractère.
export function logStorageSize() {
    if (!window.AXE.STORAGE_SIZE) return;

    // une ligne par clé (le nom de la clé sert d'index), puis une ligne TOTAL
    const rows = {};
    let total = 0;
    for (const key of Object.keys(localStorage)) {
        const size = (key.length + localStorage.getItem(key).length) * 2;
        total += size;
        rows[key] = { "taille (Ko)": (size / 1024).toFixed(2) };
    }
    rows["TOTAL"] = { "taille (Ko)": (total / 1024).toFixed(2) };

    console.table(rows);
}
//end AI made
