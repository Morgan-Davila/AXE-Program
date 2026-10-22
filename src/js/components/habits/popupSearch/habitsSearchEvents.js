import { createDebug } from "../../../debug.js";

const LOCAL_DEBUG = false;
const debug = createDebug(LOCAL_DEBUG);

debug("Chargement habitsSearchEvents.js");


import {
    searchTypes,
    //AI made
    setActiveSearch,
    clearActiveSearch,
    getVisibleHabits
} from "../habits.js";

import {
    habitsCommandIcons,
    habitsPopupOverlay,
    renderHabits
} from "../habitsUI.js";

import {
    setupHabitDeleteButton,
    setupHabitEditButton
} from "../habitsEvents.js";

import {
    searchHabitInput,
    searchLaunchButton,
    closeSearchButton,
    searchTypeSelect,
    searchTypeSelectLabel,
    searchTypeSearch,
    searchTypeInput,
    searchTypeOptions,
    renderSearchTypeOptions,
    openSearchHabitsPopup,
    closeSearchHabitsPopup,
    searchHabitsPopupOverlay
} from "./habitsSearchUI.js";

//AI made
// vrai si les résultats affichés dans la table proviennent d'une recherche
let searchActive = false;


// menu déroulant custom pour la recherche par type
//AI made
// bascule le bouton "Rechercher par type..." en barre de recherche dynamique tant que le menu est ouvert
function openSearchTypeDropdown () {
    searchTypeSelectLabel.classList.add("hiddenTypeSearch");
    searchTypeSearch.classList.remove("hiddenTypeSearch");

    searchTypeInput.value = "";
    searchTypeInput.focus();

    renderSearchTypeOptions(searchTypes(""));
    searchTypeOptions.classList.remove("hiddenTypeProposition");
    searchTypeSelect.setAttribute("aria-expanded", "true");
}

//AI made
function closeSearchTypeDropdown () {
    searchTypeSearch.classList.add("hiddenTypeSearch");
    searchTypeSelectLabel.classList.remove("hiddenTypeSearch");

    searchTypeOptions.classList.add("hiddenTypeProposition");
    searchTypeSelect.setAttribute("aria-expanded", "false");
}

//AI made
export function setupSearchTypeDropdown () {

    if (!searchTypeSelect || !searchTypeOptions || !searchTypeInput) return;

    searchTypeSelect.addEventListener("click", (event) => {
        event.stopPropagation();

        const isOpen = !searchTypeOptions.classList.contains("hiddenTypeProposition");

        if (isOpen) return; // le champ de recherche est déjà actif, on laisse l'utilisateur taper

        openSearchTypeDropdown();
    });

    searchTypeInput.addEventListener("input", () => {
        renderSearchTypeOptions(searchTypes(searchTypeInput.value));
    });

    searchTypeOptions.addEventListener("click", (event) => {
        const reset = event.target.closest(".searchTypeOptions__reset");

        if (reset) {
            searchTypeSelectLabel.textContent = "Rechercher par type...";
            delete searchTypeSelect.dataset.value;

            closeSearchTypeDropdown();
            return;
        }

        const item = event.target.closest(".searchTypeOptions__item");

        if (!item) return;

        searchTypeSelectLabel.textContent = item.textContent;
        searchTypeSelect.dataset.value = item.textContent;

        closeSearchTypeDropdown();
    });

    document.addEventListener("click", (event) => {
        if (searchTypeSelect.contains(event.target) || searchTypeOptions.contains(event.target)) return;

        closeSearchTypeDropdown();
    });

}


//AI made
// ferme le popup de recherche et, si une recherche est en cours, propose de revenir à la liste complète
function closeSearchPopup () {
    closeSearchHabitsPopup();

    if (searchActive && closeSearchButton) {
        closeSearchButton.classList.remove("hiddenCloseSearch");
    }
}

//AI made
// exécute la recherche (nom + type), affiche les résultats dans la table principale puis ferme le popup
export function setupSearchLaunch () {

    if (!searchLaunchButton || !searchHabitInput) return;

    const runSearch = () => {
        //AI made — les critères sont mémorisés pour que création/édition gardent le filtre
        setActiveSearch(searchHabitInput.value, searchTypeSelect.dataset.value);

        searchActive = true;
        renderHabits(getVisibleHabits());
        setupHabitDeleteButton();
        setupHabitEditButton();
        closeSearchPopup();
    };

    searchLaunchButton.addEventListener("click", runSearch);

    searchHabitInput.addEventListener("keydown", (event) => {
        if (event.key !== "Enter") return;

        event.preventDefault();
        runSearch();
    });
}

//AI made
// remet la table à l'état normal (habitArray complet) et masque le bouton
function clearSearch () {
    searchActive = false;
    //AI made
    clearActiveSearch();

    renderHabits();
    setupHabitDeleteButton();
    setupHabitEditButton();

    if (closeSearchButton) closeSearchButton.classList.add("hiddenCloseSearch");
}

//AI made
export function setupCloseSearchButton () {
    if (!closeSearchButton) return;

    closeSearchButton.addEventListener("click", clearSearch);
}


export function setupPopupOverlay () {

    if (!habitsCommandIcons.search || !searchHabitsPopupOverlay) return;

    debug(habitsCommandIcons.search)
    debug(habitsPopupOverlay)

    habitsCommandIcons.search.addEventListener("click", () =>{
        openSearchHabitsPopup();
    });

    searchHabitsPopupOverlay.addEventListener("click", (event) =>{

        if (event.target === searchHabitsPopupOverlay) {
            closeSearchPopup();
        }
    });
}
