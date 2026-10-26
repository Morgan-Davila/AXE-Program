//AI made
import { createDebug } from "../debug.js";

const LOCAL_DEBUG = false;
const debug = createDebug(LOCAL_DEBUG);

debug("Chargement testHabits.js");

import { habitArray, saveHabits } from "../services/storage.js";

//--------------------
//données de test (habitudes)
//--------------------
// Crée 30 habitudes avec un historique d'exécutions réaliste, cohérent avec leur streak :
// les `streak` dernières échéances sont faites, celle d'avant est manquée, et les plus anciennes
// sont faites ou non selon un taux de réussite propre à chaque habitude.
// Toutes ont isTest: true, pour pouvoir les retirer avec clearTestHabits() sans toucher aux vraies.
// Module non chargé par défaut : pour l'utiliser, l'importer EN HAUT de main.js (avant les rendus) :
//   import { seedTestHabits } from "./testData/testHabits.js";
//   seedTestHabits();
// Une fois importé, aussi accessible depuis la console : AXE.seedTestHabits() / AXE.clearTestHabits()
// (recharger la page ensuite pour voir le résultat)

// Rappel des fréquences :
//   interval : value = nombre de jours entre deux exécutions (1 = tous les jours)
//   weekly   : value = jours de la semaine (0 = dimanche, 1 = lundi … 6 = samedi)
//   monthly  : value = jours du mois (1 à 31)
//
// createdDaysAgo : ancienneté de l'habitude, rate : taux de réussite hors streak en cours,
// hour : heure habituelle d'exécution, streak : streak actuel visé
const TEST_HABITS = [
    // --- streaks longs ---
    { name: "Faire son lit",                  type: "Maison",       frequency: { type: "interval", value: 1 },             streak: 187, createdDaysAgo: 240, rate: 0.90, hour: 7 },
    { name: "Session Duolingo (espagnol)",    type: "Langues",      frequency: { type: "interval", value: 1 },             streak: 150, createdDaysAgo: 210, rate: 0.85, hour: 13 },
    { name: "Méditer 10 minutes",             type: "Bien-être",    frequency: { type: "interval", value: 1 },             streak: 112, createdDaysAgo: 200, rate: 0.75, hour: 7 },
    { name: "Prendre ses vitamines",          type: "Santé",        frequency: { type: "interval", value: 1 },             streak: 64,  createdDaysAgo: 100, rate: 0.80, hour: 8 },
    { name: "Planifier sa journée",           type: "Productivité", frequency: { type: "weekly",   value: [1, 2, 3, 4, 5] }, streak: 53,  createdDaysAgo: 100, rate: 0.80, hour: 8 },
    { name: "Boire 2L d'eau",                 type: "Santé",        frequency: { type: "interval", value: 1 },             streak: 42,  createdDaysAgo: 120, rate: 0.70, hour: 20 },
    { name: "Musculation",                    type: "Sport",        frequency: { type: "weekly",   value: [1, 3, 5] },       streak: 36,  createdDaysAgo: 180, rate: 0.75, hour: 18 },

    // --- streaks moyens ---
    { name: "Réviser ses flashcards",         type: "Études",       frequency: { type: "interval", value: 1 },             streak: 27,  createdDaysAgo: 60,  rate: 0.65, hour: 20 },
    { name: "Arroser les plantes",            type: "Maison",       frequency: { type: "interval", value: 3 },             streak: 22,  createdDaysAgo: 110, rate: 0.80, hour: 9 },
    { name: "Revue hebdomadaire",             type: "Productivité", frequency: { type: "weekly",   value: [5] },             streak: 21,  createdDaysAgo: 170, rate: 0.70, hour: 17 },
    { name: "Course à pied",                  type: "Sport",        frequency: { type: "weekly",   value: [2, 4, 0] },       streak: 18,  createdDaysAgo: 130, rate: 0.65, hour: 18 },
    { name: "Faire le point sur son budget",  type: "Finances",     frequency: { type: "weekly",   value: [0] },             streak: 14,  createdDaysAgo: 140, rate: 0.75, hour: 21 },
    { name: "Cuisiner un repas maison",       type: "Alimentation", frequency: { type: "weekly",   value: [1, 2, 3, 4, 5] }, streak: 13,  createdDaysAgo: 75,  rate: 0.60, hour: 19 },
    { name: "Ménage de la chambre",           type: "Maison",       frequency: { type: "weekly",   value: [6] },             streak: 11,  createdDaysAgo: 120, rate: 0.70, hour: 11 },
    { name: "Lire 20 pages",                  type: "Culture",      frequency: { type: "interval", value: 1 },             streak: 9,   createdDaysAgo: 150, rate: 0.60, hour: 22 },
    { name: "Payer le loyer",                 type: "Finances",     frequency: { type: "monthly",  value: [1] },             streak: 9,   createdDaysAgo: 290, rate: 0.95, hour: 10 },
    { name: "Faire une lessive",              type: "Maison",       frequency: { type: "interval", value: 4 },             streak: 8,   createdDaysAgo: 90,  rate: 0.70, hour: 19 },
    { name: "Meal prep de la semaine",        type: "Alimentation", frequency: { type: "weekly",   value: [0] },             streak: 7,   createdDaysAgo: 70,  rate: 0.60, hour: 16 },

    // --- streaks courts ---
    { name: "Virement sur le livret épargne", type: "Finances",     frequency: { type: "monthly",  value: [5] },             streak: 6,   createdDaysAgo: 200, rate: 0.85, hour: 12 },
    { name: "Changer les draps",              type: "Maison",       frequency: { type: "interval", value: 14 },            streak: 6,   createdDaysAgo: 110, rate: 0.70, hour: 10 },
    { name: "Yoga",                           type: "Sport",        frequency: { type: "weekly",   value: [6] },             streak: 5,   createdDaysAgo: 70,  rate: 0.55, hour: 10 },
    { name: "Bilan du mois",                  type: "Productivité", frequency: { type: "monthly",  value: [28] },            streak: 4,   createdDaysAgo: 160, rate: 0.70, hour: 20 },
    { name: "Pratiquer la guitare",           type: "Créativité",   frequency: { type: "weekly",   value: [1, 3, 5] },       streak: 4,   createdDaysAgo: 50,  rate: 0.50, hour: 20 },
    { name: "Pas d'écran avant de dormir",    type: "Bien-être",    frequency: { type: "interval", value: 1 },             streak: 3,   createdDaysAgo: 60,  rate: 0.45, hour: 23 },
    { name: "Appeler mes grands-parents",     type: "Social",       frequency: { type: "weekly",   value: [0] },             streak: 2,   createdDaysAgo: 80,  rate: 0.60, hour: 17 },
    { name: "Trier sa boîte mail",            type: "Travail",      frequency: { type: "weekly",   value: [1, 4] },          streak: 1,   createdDaysAgo: 30,  rate: 0.50, hour: 9 },

    // --- streaks cassés (0) ---
    { name: "Marcher 10 000 pas",             type: "Sport",        frequency: { type: "interval", value: 1 },             streak: 0,   createdDaysAgo: 90,  rate: 0.55, hour: 19 },
    { name: "Journal de gratitude",           type: "Bien-être",    frequency: { type: "interval", value: 1 },             streak: 0,   createdDaysAgo: 45,  rate: 0.40, hour: 22 },
    { name: "Dessiner 15 minutes",            type: "Créativité",   frequency: { type: "interval", value: 2 },             streak: 0,   createdDaysAgo: 40,  rate: 0.45, hour: 21 },
    { name: "Aller à la piscine",             type: "Sport",        frequency: { type: "weekly",   value: [3, 6] },          streak: 0,   createdDaysAgo: 60,  rate: 0.50, hour: 12 }
];

// probabilité qu'une habitude due aujourd'hui soit déjà cochée (si son heure habituelle est passée)
const DONE_TODAY_RATE = 0.4;

function randomInt(min, max) {
    return min + Math.floor(Math.random() * (max - min + 1));
}

// minuit du jour situé `daysAgo` jours avant aujourd'hui
function dayStart(daysAgo) {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate() - daysAgo);
}

// timestamp d'une exécution `daysAgo` jours avant aujourd'hui, autour de l'heure habituelle (± 45 min)
function executionTime(daysAgo, hour) {
    const date = dayStart(daysAgo);
    const minutes = Math.min(Math.max(hour * 60 + randomInt(-45, 45), 0), 23 * 60 + 59);
    date.setMinutes(minutes);
    return date.getTime();
}

function isDueOn(frequency, daysAgo) {
    const day = dayStart(daysAgo);
    const days = frequency.value.map(Number);

    return frequency.type === "weekly"
        ? days.includes(day.getDay())
        : days.includes(day.getDate());
}

// vrai si l'habitude peut être marquée comme faite aujourd'hui (heure habituelle déjà passée)
function canBeDoneToday(hour) {
    return new Date().getHours() > hour && Math.random() < DONE_TODAY_RATE;
}

// weekly / monthly : on part de la dernière échéance passée et on remonte le temps.
// Renvoie les jours d'exécution (en "jours avant aujourd'hui") et le streak réellement obtenu.
function buildCalendarHistory(habit) {
    const daysAgoList = [];
    let target = habit.streak;

    // échéance d'aujourd'hui déjà faite : elle compte dans le streak
    if (target > 0 && isDueOn(habit.frequency, 0) && canBeDoneToday(habit.hour)) {
        daysAgoList.push(0);
        target--;
    }

    let done = 0;
    let broken = false;

    for (let daysAgo = 1; daysAgo < habit.createdDaysAgo; daysAgo++) {
        if (!isDueOn(habit.frequency, daysAgo)) continue;

        if (done < target) {
            // échéances du streak en cours : toutes faites
            daysAgoList.push(daysAgo);
            done++;
        } else if (!broken) {
            // l'échéance juste avant le streak est manquée (c'est elle qui l'a remis à 0)
            broken = true;
        } else if (Math.random() < habit.rate) {
            daysAgoList.push(daysAgo);
        }
    }

    // si l'habitude est trop récente pour atteindre le streak visé, on garde ce qui a été possible
    const streak = habit.streak - target + done;

    return { daysAgoList, streak };
}

// interval : chaque exécution repousse la suivante de `value` jours.
// Une exécution en retard (écart > value) casse le streak.
function buildIntervalHistory(habit) {
    const interval = Number(habit.frequency.value);
    const daysAgoList = [];
    let streak = 0;

    // dernière exécution : aujourd'hui, ou assez récente pour que l'échéance ne soit pas manquée
    let daysAgo;
    if (habit.streak === 0) {
        daysAgo = interval + randomInt(1, 3);
    } else {
        daysAgo = canBeDoneToday(habit.hour) ? 0 : randomInt(1, interval);
    }

    // streak en cours : exécutions pile à l'heure
    while (streak < habit.streak && daysAgo < habit.createdDaysAgo) {
        daysAgoList.push(daysAgo);
        streak++;
        daysAgo += interval;
    }

    // la cassure juste avant le streak, puis l'historique plus ancien
    if (habit.streak > 0) daysAgo += randomInt(1, 3);

    while (daysAgo < habit.createdDaysAgo) {
        daysAgoList.push(daysAgo);
        daysAgo += Math.random() < habit.rate ? interval : interval + randomInt(1, 4);
    }

    return { daysAgoList, streak };
}

function createTestHabit(habit, index) {
    const { daysAgoList, streak } = habit.frequency.type === "interval"
        ? buildIntervalHistory(habit)
        : buildCalendarHistory(habit);

    // les exécutions sont rangées de la plus ancienne à la plus récente (le code lit executions.at(-1))
    const executions = daysAgoList
        .map(daysAgo => executionTime(daysAgo, habit.hour))
        .sort((a, b) => a - b);

    habitArray.push({
        // Date.now() seul donnerait le même id à toutes les habitudes créées dans la même milliseconde
        id: Date.now() + index,
        name: habit.name,
        type: habit.type,
        frequency: { type: habit.frequency.type, value: habit.frequency.value },
        streak: streak,
        createdAt: executionTime(habit.createdDaysAgo, 9),
        executions: executions,
        isTest: true
    });
}

// Ajoute les habitudes de test (une seule fois : ne fait rien si elles existent déjà)
export function seedTestHabits() {
    const alreadySeeded = habitArray.some(habit => habit.isTest);
    if (alreadySeeded) {
        debug("Habitudes de test déjà présentes");
        return;
    }

    TEST_HABITS.forEach(createTestHabit);

    saveHabits();
    debug(`${TEST_HABITS.length} habitudes de test ajoutées`);
}

// Retire uniquement les habitudes de test
// (le tableau importé ne peut pas être réassigné ici : on le vide sur place)
export function clearTestHabits() {
    for (let i = habitArray.length - 1; i >= 0; i--) {
        if (habitArray[i].isTest) habitArray.splice(i, 1);
    }

    saveHabits();
}

// accessibles depuis la console du navigateur
window.AXE.seedTestHabits = seedTestHabits;
window.AXE.clearTestHabits = clearTestHabits;
//end AI made
