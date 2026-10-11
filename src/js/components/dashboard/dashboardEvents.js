const LOCAL_DEBUG = false;

debug(LOCAL_DEBUG, "Chargement dashboardEvents.js");

import { getHabit, habitArray, updateHabit } from "../../services/storage.js";
import {
    safeQuery,
    safeQueryAll,
    safeId
} from "./../../utils/dom.js"
import { reactHabit } from "./dashboard.js";
//AI made
import { resetMissedStreaks } from "./dashboard.js";
//AI made
import { recallPlace, playCheckPulse } from "./dashboardUI.js";
import { burstConfetti } from "./../../utils/effects.js";

// import { checkboxRecalls } from "./dashboardUI.js";


export function setupRecallsCheckmarks () {
    const checkboxRecalls = safeQueryAll(".habits__cell__checkmark");
    debug(LOCAL_DEBUG, checkboxRecalls)

    for (let checkmark of checkboxRecalls) {
        const checkbox = checkmark.querySelector("input[type='checkbox']");

        checkbox.addEventListener("change", (event) => {
            const checkmarkArticle = event.currentTarget.closest(".habits__cell");
            const checkmarkId = Number(checkmarkArticle.dataset.habitId);

            // debug(LOCAL_DEBUG, checkmarkArticle)
            // debug(LOCAL_DEBUG, checkmarkId)
            const timestamp = Date.now();

            const habit = getHabit(checkmarkId);
            habit.executions.push(timestamp);
            habit.streak += 1;

            updateHabit(checkmarkId, habit);
            reactHabit(habitArray);
            //AI made — les cartes viennent d'être re-rendues : on rebranche les nouvelles checkbox
            setupRecallsCheckmarks();
        });
    }
}

//AI made
// Effets visuels à la validation d'une habitude (confettis + pulsation).
// Écoute par délégation sur .habits : ne touche pas au listener de setupRecallsCheckmarks
// et continue de fonctionner après chaque re-render des cartes.
export function setupCheckEffects () {
    if (!recallPlace) return;

    // phase de capture : on part AVANT le listener existant, qui re-render les cartes
    // (la checkmark cliquée est alors encore dans le DOM, on peut lire sa position)
    recallPlace.addEventListener("change", (event) => {
        const checkbox = event.target;
        if (!checkbox.matches("input[type='checkbox']") || !checkbox.checked) return;

        const checkmark = checkbox.parentElement.querySelector(".checkmark");
        burstConfetti(checkmark ? checkmark.getBoundingClientRect() : checkbox.getBoundingClientRect());
    }, true);

    // phase de bouillonnement : les cartes ont été re-rendues, on anime la nouvelle carte "faite"
    recallPlace.addEventListener("change", (event) => {
        const checkbox = event.target;
        if (!checkbox.matches("input[type='checkbox']") || !checkbox.checked) return;

        const habitId = checkbox.closest(".habits__cell")?.dataset.habitId;
        if (habitId !== undefined) playCheckPulse(habitId);
    });
}


//AI made
// Si la page reste ouverte au passage de minuit : on remet à 0 les streaks des échéances manquées
// la veille et on re-rend le dashboard (les habitudes du nouveau jour apparaissent).
export function setupMidnightRefresh () {
    const now = new Date();
    const nextMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

    // +1 s de marge pour être sûr d'être passé au jour suivant
    setTimeout(() => {
        resetMissedStreaks(habitArray);
        reactHabit(habitArray);
        setupRecallsCheckmarks();

        setupMidnightRefresh();
    }, nextMidnight - now + 1000);
}
