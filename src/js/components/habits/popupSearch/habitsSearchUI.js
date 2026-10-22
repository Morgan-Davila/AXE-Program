import { createDebug } from "../../../debug.js";

const LOCAL_DEBUG = false;
const debug = createDebug(LOCAL_DEBUG);

debug("Chargement habitsSearchUI.js");


import {
    safeQuery,
    safeId
} from "../../../utils/dom.js";


// recherche d'habitudes
//AI made
export const searchHabitInput = safeId("searchHabitInput");

//AI made
export const searchLaunchButton = safeId("searchLaunchButton");

//AI made
export const closeSearchButton = safeId("closeSearchButton");

export const searchTypeSelect = safeId("searchTypeSelect");

//AI made
export const searchTypeSelectLabel = safeId("searchTypeSelectLabel");

//AI made
export const searchTypeSearch = safeId("searchTypeSearch");

//AI made
export const searchTypeInput = safeId("searchTypeInput");

export const searchTypeOptions = safeId("searchTypeOptions");

export const searchHabitsPopupOverlay = safeQuery(".searchHabitPopupOverlay");

//search habit Popup

// ouvrir et fermer la popup
export function openSearchHabitsPopup () {

    if (!searchHabitsPopupOverlay) return;

    //AI made
    // reset de l'état de recherche à chaque ouverture
    if (searchHabitInput) searchHabitInput.value = "";
    if (searchTypeSelectLabel) searchTypeSelectLabel.textContent = "Rechercher par type...";
    if (searchTypeSelect) delete searchTypeSelect.dataset.value;

    searchHabitsPopupOverlay.classList.remove("hiddenSearchPopup");
}



export function closeSearchHabitsPopup () {

    if (!searchHabitsPopupOverlay) return;
    searchHabitsPopupOverlay.classList.add("hiddenSearchPopup");
}



//AI made
// remplit la liste déroulante custom de recherche par type
export function renderSearchTypeOptions (types) {

    if (!searchTypeOptions) return;

    searchTypeOptions.innerHTML = "";

    // permet toujours d'annuler le filtre par type en cours
    const reset = document.createElement("div");
    reset.classList.add("searchTypeOptions__reset");
    reset.textContent = "Tous les types";
    searchTypeOptions.appendChild(reset);

    if (types.length === 0) {
        const empty = document.createElement("div");
        empty.classList.add("searchTypeOptions__empty");
        empty.textContent = "Aucun type correspondant";

        searchTypeOptions.appendChild(empty);
        return;
    }

    for (let type of types.slice(0, 4)) { // jamais plus de 4 types proposés
        const item = document.createElement("div");
        item.classList.add("searchTypeOptions__item");
        item.setAttribute("role", "option");
        item.textContent = type;

        searchTypeOptions.appendChild(item);
    }
}
