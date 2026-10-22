//AI made
// Effets visuels génériques (compteurs animés, confettis), repris du redesign.
// Aucune logique métier ici : uniquement du DOM décoratif.

import { createDebug } from "../debug.js";

const LOCAL_DEBUG = false;
const debug = createDebug(LOCAL_DEBUG);

debug("Chargement effects.js");



//AI made
export function prefersReducedMotion() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}



//AI made
/*
Anime le texte d'un élément de sa valeur actuelle jusqu'à `target`.
La valeur courante est gardée dans data-count-value pour repartir de là au prochain appel.
*/
export function countUp(element, target, { duration = 900, suffix = "" } = {}) {

    if (!element) return;

    const start = Number(element.dataset.countValue ?? 0);
    element.dataset.countValue = target;

    if (prefersReducedMotion() || start === target) {
        element.textContent = `${target}${suffix}`;
        return;
    }

    const startTime = performance.now();

    function frame() {
        // performance.now() plutôt que l'horodatage de requestAnimationFrame, qui peut être en retard sur startTime
        const progress = Math.min(1, Math.max(0, (performance.now() - startTime) / duration));
        const eased = 1 - Math.pow(1 - progress, 3);

        element.textContent = `${Math.round(start + (target - start) * eased)}${suffix}`;

        if (progress < 1) requestAnimationFrame(frame);
    }

    requestAnimationFrame(frame);

}



let confettiLayer = null;

//AI made
/*
Fait jaillir des confettis depuis le centre de `origin`.
`origin` peut être un élément ou un DOMRect (utile quand l'élément va être retiré du DOM).
*/
export function burstConfetti(origin) {

    if (!origin || prefersReducedMotion()) return;

    if (!confettiLayer) {
        confettiLayer = document.createElement("div");
        confettiLayer.className = "confetti-layer";
        confettiLayer.setAttribute("aria-hidden", "true");
        document.body.appendChild(confettiLayer);
    }

    const rect = origin instanceof Element ? origin.getBoundingClientRect() : origin;
    const originX = rect.left + rect.width / 2;
    const originY = rect.top + rect.height / 2;

    const palette = ["#0F52BA", "#4338CA", "#34A853", "#F59E0B"];
    const pieceCount = 16;

    for (let i = 0; i < pieceCount; i++) {
        const piece = document.createElement("span");
        piece.className = "confetti-piece";

        const angle = (Math.PI * 2 * i) / pieceCount + Math.random() * 0.4;
        const distance = 60 + Math.random() * 50;

        piece.style.setProperty("--x", `${originX}px`);
        piece.style.setProperty("--y", `${originY}px`);
        piece.style.setProperty("--piece-color", palette[i % palette.length]);
        piece.style.setProperty("--piece-dx", `${Math.cos(angle) * distance}px`);
        piece.style.setProperty("--piece-dy", `${Math.sin(angle) * distance}px`);
        piece.style.setProperty("--piece-rot", `${Math.round(Math.random() * 360)}deg`);
        piece.style.setProperty("--piece-duration", `${600 + Math.random() * 300}ms`);
        piece.style.setProperty("--piece-delay", `${Math.random() * 60}ms`);

        piece.addEventListener("animationend", () => piece.remove(), { once: true });
        confettiLayer.appendChild(piece);
    }

}