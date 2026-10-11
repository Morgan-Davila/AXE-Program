const LOCAL_DEBUG = false;

debug(LOCAL_DEBUG, "Chargement error.js");


export function showErrorPopup(message, duration = 3000) {
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