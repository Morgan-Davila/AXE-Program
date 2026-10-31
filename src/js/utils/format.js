import { createDebug } from "../debug.js";
import { 
    getFolderPath 
} from "../services/storage/storageFolders.js";

const LOCAL_DEBUG = true;
const debug = createDebug(LOCAL_DEBUG);

debug("Chargement format.js");




// ----------------------
// Date
// ----------------------

//AI made
export function formatDate(timestamp) {

    const date = new Date(Number(timestamp));

    if (Number.isNaN(date.getTime())) {
        debug("formatDate : valeur invalide", timestamp);
        return "";
    }

    return date.toLocaleDateString("fr-FR");
}

//AI made
export function formatTime(timestamp) {

    const date = new Date(Number(timestamp));

    if (Number.isNaN(date.getTime())) {
        debug("formatTime : valeur invalide", timestamp);
        return "";
    }

    return date.toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit"
    });
}




// ----------------------
// Fréquence
// ----------------------

// Fonction pour joindre une liste avec la grammaire française
export function joinFrench(list) {

    if (!Array.isArray(list) || list.length === 0) {
        return "";
    }

    if (list.length === 1) {
        return list[0];
    }

    if (list.length === 2) {
        return `${list[0]} et ${list[1]}`;
    }

    return `${list.slice(0, -1).join(", ")} et ${list.at(-1)}`;
}





// Traduit les valeurs de fréquence en texte utilisateur
export function translateFrequency(data) {

    if (!data?.frequency) {
        debug("translateFrequency : fréquence absente", data);
        return "";
    }

    const { type, value } = data.frequency;

    switch (type) {
        case "interval":
            return value === 1
                ? "Tous les jours"
                : `Tous les ${value} jours`;

        case "weekly": {
            const days = [
                "dimanche",
                "lundi",
                "mardi",
                "mercredi",
                "jeudi",
                "vendredi",
                "samedi"
            ];

            if (!Array.isArray(value)) {
                debug("translateFrequency weekly : valeur invalide", value);
                return "";
            }

            return `Chaque ${joinFrench(
                value.map(day => days[day]).filter(Boolean)
            )}`;
        }

        case "monthly":
            if (!Array.isArray(value)) {
                debug("translateFrequency monthly : valeur invalide", value);
                return "";
            }
            return `Chaque ${joinFrench(value)} du mois`;

        default:
            debug("translateFrequency : type inconnu", type);
            return "";
    }

}


// ----------------------
// Streak
// ----------------------

//AI made
// palier de couleur du badge streak : "cold" (< 3), "low" (3 à 6), "high" (7 et plus)
export function streakTier(streak) {

    streak = Number(streak);

    if (streak >= 7) return "high";
    if (streak >= 3) return "low";

    return "cold";

}




//human made
export function getFolderTextualPath (mode, folderId) {

    switch (mode) {
        case "textual" : {
            const pathArray = getFolderPath(folderId);

            const textPath = pathArray.map(folder => folder.name);

            textPath.unshift("Racine");

            const finalTextPath = textPath.join(" > ");

            return finalTextPath; // ex return : Racine > Histoire
        }

        case "array" : {
            const pathArray = getFolderPath(folderId);
            
            const crumbs = pathArray.map(folder => ({name : folder.name, id : folder.id}));

            crumbs.unshift({name : "Racine", id : null});

            return crumbs;  
            /* ex return : 
                [
                    {
                        "name": "racine",
                        "id": null
                    },
                    {
                        "name": "Maths",
                        "id": "d30d5e2d-75f6-431a-84ed-d3461c6d832b"
                    }
                ]*/
        }
    }
    
}