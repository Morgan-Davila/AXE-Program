import { createDebug } from "../../debug.js";

const LOCAL_DEBUG = false;
const debug = createDebug(LOCAL_DEBUG);

debug("Chargement dashboard.js");


//AI made
import { 
    updateHabit 
} from "../../services/storage/storageHabits.js";
import {
    safeQuery,
    safeQueryAll,
    safeId
} from "./../../utils/dom.js"

import {
    isSameDay
} from "./../../utils/date.js"

import { renderRecalls, recallPlace } from "./dashboardUI.js";
//AI made
import { renderProgressRing, renderDashboardStats, renderWeeklyChart } from "./dashboardUI.js";

export function reactHabit (habitArray) {
    //AI made — reactHabit est appelée sur toutes les pages : rien à rendre hors du dashboard
    if (!recallPlace) return;

    const dueHabits = [];
    const doneHabits = [];

    for (let habit of habitArray) {
        let type = habit.frequency.type;

        const lastExecution = new Date(Number(habit.executions?.at(-1) ?? habit.createdAt)); //si l'habit viens d'étre créé et qu'il n'y a pas encore d'éexecution, alors on utilise la date de création
        const now = new Date();

        // on ne veut sauter l'habit que si elle a une exécution reelle aujourd'hui, pas juste une date de création du jour
        const doneToday = habit.executions?.some(execution => isSameDay(Number(execution), now)) ?? false;
        if (doneToday) {
            doneHabits.push(habit);
            
            continue;
        } 

        let isDueToday = false;

        switch (type) {
            //AI made
            case "interval": {
                const interval = Number(habit.frequency.value);

                const today = new Date();
                const msParDay = 1000 * 60 * 60 * 24;

                // On neutralise les heures pour comparer des jours "propres"
                const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
                const lastExecMidnight = new Date(
                    lastExecution.getFullYear(),
                    lastExecution.getMonth(),
                    lastExecution.getDate()
                );

                const diffJours = Math.round((todayMidnight - lastExecMidnight) / msParDay);

                //AI made — ">=" et non "===" : une habitude en retard reste due jusqu'à ce qu'elle soit faite
                // (avec "===", une échéance manquée la faisait disparaître du dashboard pour toujours)
                isDueToday = diffJours >= interval;

                break;
            }

            case "weekly" : {
                const dayOfWeek = new Date().getDay();

                isDueToday = habit.frequency.value.map(Number).includes(dayOfWeek);
                break;
            }

            case "monthly" : {
                const dayOfMonth = new Date().getDate();

                isDueToday = habit.frequency.value.map(Number).includes(dayOfMonth);
                break;
            }
        }

        if (!isDueToday) continue;
        dueHabits.push(habit);
        //continue veut dire passer a l'iteration suivante dans le for
    }

    recallPlace.innerHTML = ""; //je vide avant de tout re-render

    if (doneHabits.length !== 0) {
        renderRecalls(doneHabits, true);
    }
    if (dueHabits.length !== 0 ) {
        renderRecalls(dueHabits, false);
    }

    //AI made — effets visuels du redesign (anneau du jour, chiffres clés, graphique de la semaine)
    const totalToday = doneHabits.length + dueHabits.length;
    const dailyCounts = computeDailyCompletions(habitArray, 7);
    const weekTotal = dailyCounts.reduce((sum, count) => sum + count, 0);

    renderProgressRing(doneHabits.length, totalToday);
    renderDashboardStats(doneHabits.length, totalToday, weekTotal);
    renderWeeklyChart(dailyCounts);

}


//AI made
// nombre d'exécutions (toutes habitudes confondues) par jour, sur les `days` derniers jours (le dernier = aujourd'hui)
export function computeDailyCompletions (habitArray, days) {
    const counts = new Array(days).fill(0);
    const msParDay = 1000 * 60 * 60 * 24;

    const today = new Date();
    const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    for (let habit of habitArray) {
        for (let execution of habit.executions ?? []) {
            const date = new Date(Number(execution));
            const execMidnight = new Date(date.getFullYear(), date.getMonth(), date.getDate());

            const diffJours = Math.round((todayMidnight - execMidnight) / msParDay);

            if (diffJours >= 0 && diffJours < days) counts[days - 1 - diffJours] += 1;
        }
    }

    return counts;
}



// ---- Remise à zéro des streaks ----

const MS_PER_DAY = 1000 * 60 * 60 * 24;

//AI made
function startOfDay (timestamp) {
    const date = new Date(timestamp);

    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

//AI made
// nombre de jours calendaires entre deux dates (Math.round absorbe les changements d'heure)
function diffInDays (from, to) {
    return Math.round((startOfDay(to) - startOfDay(from)) / MS_PER_DAY);
}


//AI made
// vrai si une échéance de l'habitude tombait sur un jour DÉJÀ TERMINÉ sans avoir été faite.
// Référence : la dernière exécution (ou la création si l'habitude n'a jamais été faite).
// Aujourd'hui ne compte pas : la journée n'est pas finie.
export function hasMissedOccurrence (habit, now = Date.now()) {
    const reference = Number(habit.executions?.at(-1) ?? habit.createdAt);
    const gap = diffInDays(reference, now);

    // aucun jour complet entre la référence et aujourd'hui
    if (gap <= 1) return false;

    const { type, value } = habit.frequency;

    switch (type) {
        case "interval": {
            // échéance à référence + intervalle : manquée si ce jour est passé
            return gap > Number(value);
        }

        case "weekly":
        case "monthly": {
            const days = (value ?? []).map(Number);
            if (days.length === 0) return false;

            // au-delà d'un an, une échéance a forcément été manquée
            if (gap > 366) return true;

            // on passe en revue chaque jour strictement entre la référence et aujourd'hui
            for (let offset = 1; offset < gap; offset++) {
                const day = startOfDay(reference);
                day.setDate(day.getDate() + offset);

                const isDue = type === "weekly"
                    ? days.includes(day.getDay())
                    : days.includes(day.getDate());

                if (isDue) return true;
            }

            return false;
        }

        default:
            return false;
    }
}


//AI made
// remet à 0 (et sauvegarde) le streak des habitudes dont une échéance a été manquée
export function resetMissedStreaks (habitArray, now = Date.now()) {
    let resetCount = 0;

    for (let habit of habitArray) {
        if (Number(habit.streak) === 0) continue;
        if (!hasMissedOccurrence(habit, now)) continue;

        updateHabit(habit.id, { streak: 0 });
        resetCount++;
    }

    debug(`resetMissedStreaks : ${resetCount} streak(s) remis à 0`);

    return resetCount;
}
