import { createDebug } from "../debug.js";

const LOCAL_DEBUG = false;
const debug = createDebug(LOCAL_DEBUG);

debug("Chargement error.js");


//AI made : variant "success" pour réutiliser la même popup en vert (ex. "Recto copié")
export function showSuccessPopup(message, duration = 3000) {
    showErrorPopup(message, duration, "success");
}
//end AI made

export function showErrorPopup(message, duration = 3000, variant = "error") {
    // Conteneur des popups : créé une seule fois, réutilisé ensuite
    let container = document.getElementById("errorPopups");
    if (!container) {
        container = document.createElement("div");
        container.id = "errorPopups";
        document.body.append(container);
    }

    // La popup elle-même
    const popup = document.createElement("div");
    popup.className = "errorPopup";
    popup.setAttribute("role", "alert");   // les lecteurs d'écran l'annoncent
    //AI made : une réussite est annoncée poliment ("status") au lieu d'interrompre ("alert")
    if (variant === "success") {
        popup.classList.add("errorPopup--success");
        popup.setAttribute("role", "status");
    }
    //end AI made
    popup.textContent = message;           // textContent et pas innerHTML (plus sûr)
    container.append(popup);

    // On ajoute la classe au prochain affichage pour que l'animation d'entrée se joue
    requestAnimationFrame(() => popup.classList.add("errorPopup--visible"));

    // Après "duration" ms : animation de sortie, puis suppression du DOM
    setTimeout(() => {
        popup.classList.remove("errorPopup--visible");
        setTimeout(() => popup.remove(), 300);   // 300 ms = durée de la transition CSS
    }, duration);
}

export function showErrorEffectOn (element, duration = 3000) {
    element.classList.add("error")

    setTimeout ( () => {
        element.classList.remove("error")
    }, duration);
}

export function showError (element, message) {
    showErrorPopup(message);
    showErrorEffectOn(element);
}
