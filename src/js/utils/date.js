import { createDebug } from "../debug.js";

const LOCAL_DEBUG = false;
const debug = createDebug(LOCAL_DEBUG);

debug("Chargement date.js");

import {
    safeQuery,
    safeId
} from "./dom.js"


export function updateHeader() {
    const now = new Date();

    const hourBox = safeQuery('.header__hour-Box__text');
    if (hourBox) {
        hourBox.textContent = now.toLocaleTimeString('fr-FR', {
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    const day = now.toLocaleDateString('fr-FR', {
        weekday: 'long'
    });

    const dayBox = safeQuery('.header__day-Box__text');
    if (dayBox) {
        dayBox.textContent = day.charAt(0).toUpperCase() + day.slice(1);
    }
}

export function updateFooter() {
    const yearSpan = safeId("year");
    if (!yearSpan) return;

    yearSpan.textContent = new Date().getFullYear();
}

//AI made
export function isSameDay(timestamp1, timestamp2) {
  const date1 = new Date(timestamp1);
  const date2 = new Date(timestamp2);

  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}