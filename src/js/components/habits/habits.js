import { createDebug } from "../../debug.js";

const LOCAL_DEBUG = false;
const debug = createDebug(LOCAL_DEBUG);

debug("Chargement habits.js"); //test

import { habitArray } from "../../services/storage.js";
import {
    safeQuery,
    safeQueryAll,
    safeId,
    exists
} from "./../../utils/dom.js"
import { renderTypesProposition } from "./habitsUI.js";


let typesArray = [];


//cette fonction générique récupère tout les chceckbox:checked dans un espace donné (form) qui portent un selector précis (selector)
//Cette fonction doit etre mise dans un autre endroit a l'avenir
function getCheckedCheckboxValues(form, selector) {
    return [...safeQueryAll(selector + ":checked", form)]
        .map(checkbox => Number(checkbox.value));
}


export function getFrequency() {
    const tabs = {
        interval : safeId("tab1"),
        weekly : safeId("tab2"),
        monthly : safeId("tab3")
    }

    let frequency = {
        value: null,
        type: null
    };

    // Sécurité : pas de tabs de fréquence sur cette page
    if (!tabs.interval || !tabs.weekly || !tabs.monthly) return frequency;

    const tab = safeQuery(".tab.activeTabs")?.dataset.tab;

    debug(tab);

    switch (tab) {
        case tabs.interval.id : {
            frequency.value = Number(
                safeQuery(".frequency-interval__input").value
            );
            frequency.type = "interval"
            break;
        }

        case tabs.weekly.id : {
            const form = tabs.weekly;
            frequency.value = getCheckedCheckboxValues(form, ".inp-cbx")
            frequency.type = "weekly"
            break;
        }

        case tabs.monthly.id : {
            const form = tabs.monthly;
            frequency.value = getCheckedCheckboxValues(form, ".inp-cbx");
            frequency.type = "monthly";
            break;
        }
    }

    return frequency;
}








//cette fonction de charge de créer une habit
export function createHabit(data){
    typesArray.push(data.type);
    return {
        id: Date.now(),

        name: data.name,

        type: data.type,

        frequency: getFrequency(),

        streak: 0,

        createdAt: Date.now(),

        executions : []
    };
    
}

export function editDataHabit (data) {
    return {
        name: data.name,

        type: data.type,

        frequency: getFrequency(),

    };
}






export function setupTypePropositionSelection () {
    document.addEventListener("DOMContentLoaded", () => {
        

        for (let habit of habitArray) {
            if (!typesArray.includes(habit.type)) {
                typesArray.push(habit.type);
            }
        }
        debug(typesArray)


        renderTypesProposition(typesArray); //initial rendering
    })
}

export function getAllTypes() {
    debug(typesArray)
    return typesArray;
}

//AI made
// normalisation et standardisation du texte pour une recherche insensible aux accents/casse
function normalizeSearchText(text) {
    return text
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9\s]/g, "");
}

//AI made
export function searchTypes(search) {
    const input = normalizeSearchText(search);

    const results = typesArray
        .filter(type => normalizeSearchText(type).includes(input))
        .slice(0, 5);

    return results;
}

//AI made
// recherche d'habitudes par nom (texte libre) et par type (correspondance exacte, optionnelle)
export function searchHabits(name, type) {
    const input = normalizeSearchText(name || "");

    return habitArray.filter(habit => {
        const matchesName = normalizeSearchText(habit.name).includes(input);
        const matchesType = !type || habit.type === type;

        return matchesName && matchesType;
    });
}

//AI made
// critères de la recherche affichée dans la table (null = pas de recherche, on affiche tout)
let activeSearch = null;

//AI made
export function setActiveSearch(name, type) {
    activeSearch = { name, type };
}

//AI made
export function clearActiveSearch() {
    activeSearch = null;
}

//AI made
// habitudes à afficher dans la table : résultats de la recherche en cours (relancée pour refléter
// les dernières modifications), sinon toutes les habitudes
export function getVisibleHabits() {
    return activeSearch ? searchHabits(activeSearch.name, activeSearch.type) : habitArray;
}
