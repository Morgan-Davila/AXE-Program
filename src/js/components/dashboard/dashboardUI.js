import {
    safeQuery,
    safeQueryAll,
    safeId
} from "./../../utils/dom.js"

//AI made
import { streakTier } from "./../../utils/format.js";
import { countUp } from "./../../utils/effects.js";

import { createDebug } from "../../debug.js";

const LOCAL_DEBUG = false;
const debug = createDebug(LOCAL_DEBUG);

debug("Chargement dashboardUI.js");

export const recallPlace = safeQuery(".habits");


export function renderRecalls (dataArray, isDone) {
    for (let data of dataArray) {
        const name = data.name;
        const streak = Number(data.streak);

        const recall = document.createElement("article");
        recall.classList.add("habits__cell");
        if (isDone) recall.classList.add("habits__cell--done");

        const title = document.createElement("p");
        title.classList.add("habits__cell__title");
        title.innerText = name;

        const right = document.createElement("div");
        right.classList.add("habits__cell--right");

        const streakSpan = document.createElement("span");
        streakSpan.classList.add("habits__cell__streak");
        streakSpan.innerText = `${streak}🔥`;
        //AI made
        streakSpan.dataset.tier = streakTier(streak);

        const checkmarkWrapper = document.createElement("div");
        checkmarkWrapper.classList.add("habits__cell__checkmark");

        const label = document.createElement("label");
        label.classList.add("container");

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = isDone;
        checkbox.disabled = isDone;

        const checkmark = document.createElement("div");
        checkmark.classList.add("checkmark");

        label.appendChild(checkbox);
        label.appendChild(checkmark);

        checkmarkWrapper.appendChild(label);

        right.appendChild(streakSpan);
        right.appendChild(checkmarkWrapper);

        recall.appendChild(title);
        recall.appendChild(right);

        recall.dataset.habitId = data.id;

        recallPlace?.appendChild(recall);
    }
}


// export const checkboxRecalls = safeQueryAll(".habits__cell__checkmark");
// debug(checkboxRecalls);



//AI made
// ---- Effets visuels du redesign : anneau du jour, chiffres clés, graphique de la semaine ----

const progressRing = safeId("todayProgress");
const statDoneToday = safeId("statDoneToday");
const statWeekTotal = safeId("statWeekTotal");
const weeklyCanvas = safeId("dashboardWeeklyChart");

let weeklyChart = null;


//AI made
export function renderProgressRing (doneCount, totalCount) {

    if (!progressRing) return;

    const ratio = totalCount === 0 ? 0 : doneCount / totalCount;

    const circle = safeQuery("circle:last-child", progressRing);
    const label = safeQuery("[data-progress-label]", progressRing);

    // 88 = périmètre du cercle (r = 14), cf. stroke-dasharray dans _dashboard.scss
    if (circle) circle.style.strokeDashoffset = String(88 * (1 - ratio));
    if (label) label.textContent = `${doneCount}/${totalCount}`;

}


//AI made
export function renderDashboardStats (doneCount, totalCount, weekTotal) {

    countUp(statDoneToday, doneCount, { suffix: `/${totalCount}` });
    countUp(statWeekTotal, weekTotal);

}


//AI made
// crée le graphique au premier appel, puis se contente de mettre à jour ses données
export function renderWeeklyChart (dailyCounts) {

    if (!weeklyCanvas || !window.Chart) return;

    if (weeklyChart) {
        weeklyChart.data.datasets[0].data = dailyCounts;
        weeklyChart.update();
        return;
    }

    const labels = dailyCounts.map((_, index) => {
        const date = new Date();
        date.setDate(date.getDate() - (dailyCounts.length - 1 - index));

        return date.toLocaleDateString("fr-FR", { weekday: "short" }).replace(".", "");
    });

    const colors = getChartColors();

    weeklyChart = new window.Chart(weeklyCanvas, {
        type: "bar",
        data: {
            labels,
            datasets: [{
                data: dailyCounts,
                backgroundColor: colors.bar,
                borderRadius: 8,
                maxBarThickness: 28
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false }, tooltip: { enabled: true } },
            scales: {
                x: { grid: { display: false }, ticks: { color: colors.text } },
                y: { beginAtZero: true, ticks: { precision: 0, color: colors.text }, grid: { color: colors.grid } }
            }
        }
    });

}


//AI made
// couleurs du graphique lues dans les variables CSS du thème courant (cf. _tokens.scss)
function getChartColors () {
    const rootStyles = getComputedStyle(document.documentElement);
    const read = (name, fallback) => rootStyles.getPropertyValue(name).trim() || fallback;

    return {
        bar: read("--accent", "#0F52BA"),
        grid: read("--border", "#E4E7F2"),
        text: read("--ink-soft", "#5B6472")
    };
}


//AI made
// à appeler après un changement de thème : Chart.js ne suit pas les variables CSS tout seul
export function updateWeeklyChartColors () {

    if (!weeklyChart) return;

    const colors = getChartColors();

    weeklyChart.data.datasets[0].backgroundColor = colors.bar;
    weeklyChart.options.scales.x.ticks.color = colors.text;
    weeklyChart.options.scales.y.ticks.color = colors.text;
    weeklyChart.options.scales.y.grid.color = colors.grid;

    weeklyChart.update();

}


//AI made
// pulsation verte autour de la checkmark d'une carte (ajoutée à côté du .checkmark, jamais dedans)
export function playCheckPulse (habitId) {

    const label = safeQuery(`.habits__cell[data-habit-id="${habitId}"] .container`, recallPlace ?? document);

    if (!label) return;

    const pulse = document.createElement("span");
    pulse.classList.add("checkmark-pulse");
    pulse.addEventListener("animationend", () => pulse.remove(), { once: true });

    label.appendChild(pulse);

    // on laisse le navigateur peindre l'état initial avant de lancer l'animation
    requestAnimationFrame(() => pulse.classList.add("is-active"));

}
