const LOCAL_DEBUG = false;

debug(LOCAL_DEBUG, "Chargement habitsEvents.js");


import {
    safeQuery,
    safeQueryAll,
    safeId
} from "./../../utils/dom.js";

import {
    createHabit,
    searchTypes,
    editDataHabit,
    //AI made
    getVisibleHabits
} from "./habits.js";

import {
    addHabit,
    deleteHabit,
    getHabit,
    updateHabit
} from "./../../services/storage.js";

import {
    // variables
    renderHabits,
    habitsFormInput,
    habitsFormButton,
    habitsCommandButton,
    typeProposition,
    habitsCommandIcons,

    // functions
    habitsPopupOverlay,
    openHabitsPopup,
    closeHabitsPopup,
    renderTypesProposition,
    emptyPopup,
    insertDataInHabitPopup,
    //AI made
    removeHabitRow

} from "./habitsUI.js";

let habitPopupMode = "create";

export function setupHabitDeleteButton () {

    const buttons = safeQueryAll(".habitCell__commands__button--delete");


    for (let button of buttons) {
        button.addEventListener("click", (event) => {
            const parent = event.target.closest("tr")
            
            const habitID = Number(parent.dataset.habitId);

            //AI made : deleteHabit archive elle-même l'habitude dans deletedHabitsArray
            deleteHabit(habitID);
            //end AI made
            //AI made — suppression animée (remplace parent.remove())
            removeHabitRow(parent);
        });
    }
    
    
}

export function setupHabitEditButton () {
    const buttons = safeQueryAll(".habitCell__commands__button--edit");

    for (let button of buttons) {
        button.addEventListener("click", (event) => {
            habitPopupMode = "edit" ;

            const parent = event.target.closest("tr")
            
            const habitID = Number(parent.dataset.habitId)
            
            const habit = getHabit(habitID);

            openHabitsPopup();
            insertDataInHabitPopup(habit);
            

            habitsFormButton.textContent = "Modifier l'habitude";

            habitsFormButton.dataset.actualId = habitID;
        });
    }
}

// gestion du bouton submit du form de la popup
export function setupHabitsForm() {

    if (!habitsFormButton) return;

    habitsFormButton.addEventListener("click", (event) => {
        event.preventDefault();

        let data = {};

        for (let key in habitsFormInput) {

            if (!habitsFormInput[key]) continue; //Si cette valeur n'existe pas (undefined, null, false, etc.), on passe directement à l'itération suivante.

            data[key] = habitsFormInput[key].value;

        }

        switch (habitPopupMode) {
            case "create" : {
                debug(LOCAL_DEBUG, data);

                const habit = createHabit(data);

                debug(LOCAL_DEBUG, habit);
                addHabit(habit);
                //AI made - garde la recherche en cours affichée
                renderHabits(getVisibleHabits());
                closeHabitsPopup();
                setupHabitDeleteButton();
                //AI made - les lignes viennent d'être re-rendues : sans ça, le bouton d'édition ne répond plus
                setupHabitEditButton();
                emptyPopup();
                break;
            }

            case "edit" : {
                const actualId = Number(habitsFormButton.dataset.actualId);
                const habit = editDataHabit(data);

                updateHabit(actualId, habit);
                //AI made — garde la recherche en cours affichée
                renderHabits(getVisibleHabits());
                closeHabitsPopup();
                setupHabitDeleteButton();
                setupHabitEditButton();

                habitsFormButton.dataset.actualId = null;
                habitPopupMode = "create";
                break;
            }
    
        }
    });

}

// gérer la popup
export function setupHabitsPopup() {

    // ouvrir la popup
    for (const button of habitsCommandButton) {

        if (!button) continue;

        button.addEventListener("click", () => {
            openHabitsPopup();
        });

    }

    // fermer la popup
    if (!habitsPopupOverlay) return;

    habitsPopupOverlay.addEventListener("click", (event) => {

        if (event.target === habitsPopupOverlay) {
            closeHabitsPopup();
        }

    });

}



export function setupPopupTypePicker () {

    if (!habitsFormInput.type || !typeProposition) return;

    habitsFormInput.type.addEventListener("focus", () =>{
        debug(LOCAL_DEBUG, "Entré");

        typeProposition.classList.toggle("hiddenTypeProposition")
    });

    habitsFormInput.type.addEventListener("blur", () =>{
        debug(LOCAL_DEBUG, "Sortie");

        typeProposition.classList.toggle("hiddenTypeProposition")
    });


    typeProposition.addEventListener("mouseover", (event) => {
        const element = event.target.closest(".propositionCell");

        if (!element) return;

        debug(LOCAL_DEBUG, element.textContent);

        habitsFormInput.type.value = element.textContent;
    });

    habitsFormInput.type.addEventListener("input", () => {
        const value = habitsFormInput.type.value;
        debug(LOCAL_DEBUG, value)
        const types = searchTypes(value);
        
        renderTypesProposition(types)

    })
    
}


// export function setupHabitManagerSearchButton () {
//     habitsCommandIcons.search
// }
// a faire