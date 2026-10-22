import { createDebug } from "../../debug.js";

const LOCAL_DEBUG = true;
const debug = createDebug(LOCAL_DEBUG);

debug("Chargement scolarUI.js"); //test


import {
    safeQuery,
    safeQueryAll,
    safeId,
    exists
} from "../../utils/dom.js"

import {
    flashcardsArray
} from "../../services/storage.js"
export const flashcardBox = safeQuery(".flashcardBox");

export const saveFlashcardButton = safeQuery(".flashcardLab__saveButton");

//AI made : références de la popup flashcard
export const flashcardCreateButton = safeQuery(".flashcardCreateButton");
export const flashcardPopupOverlay = safeQuery(".overlayPopupFlashcardLab");

//human made
export const flashcardLab = safeQuery(".popupFlashcardLab");
export const flashcardTestButton = safeQuery(".flashcardTestButton");

//AI made : carte éditable de la popup et bouton qui la retourne
export const editableFlashcard = safeQuery(".editableFlashcard");
export const flashcardSwitchButton = safeQuery(".flashcardSwitch");


//AI made
export function showFlashcardPopup() {
    if (!flashcardPopupOverlay) return;
    flashcardPopupOverlay.classList.remove("overlayPopupFlashcardLab--hidden");
}

//AI made
export function closeFlashcardPopup() {
    if (!flashcardPopupOverlay) return;
    flashcardPopupOverlay.classList.add("overlayPopupFlashcardLab--hidden");
}

//AI made
export function isFlashcardPopupOpen() {
    return exists(flashcardPopupOverlay)
        && !flashcardPopupOverlay.classList.contains("overlayPopupFlashcardLab--hidden");
}


//humain made


//AI made : retourne une carte ; block = classe BEM de la carte ("flashcard" ou "editableFlashcard")
// renvoie true si la carte montre maintenant son verso
export function flipFlashcard(card, block = "flashcard") {
    return card.classList.toggle(`${block}--flipped`);
}

export function setupFlashcardFlip() {
    const cards = safeQueryAll(".flashcard");

    cards.forEach(card => {
        card.addEventListener("click", (e) => {
            if (e.target.closest(".flashcard__commands")) return;
            flipFlashcard(card);
            hideCommandsDuringFlip(card);
        });
    });
}

//AI made : cache les commandes pendant l'animation de retournement, puis les réaffiche
function hideCommandsDuringFlip(card) {
    // pas d'animation (prefers-reduced-motion) : rien à cacher
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const inner = card.querySelector(".flashcard__inner");
    if (!inner) return;

    card.classList.add("flashcard--flipping");

    // les transitions des faces (bordure, ombre) remontent aussi jusqu'à inner : on attend celle du transform d'inner
    function onFlipEnd(e) {
        if (e.target !== inner || e.propertyName !== "transform") return;
        card.classList.remove("flashcard--flipping");
        inner.removeEventListener("transitionend", onFlipEnd);
    }

    inner.addEventListener("transitionend", onFlipEnd);
}
//end AI made

//AI made : renvoie la face actuellement visible de la carte ("front" ou "back") et son élément
export function getVisibleFlashcardFace(card) {
    const side = card.classList.contains("flashcard--flipped") ? "back" : "front";
    return { side, element: card.querySelector(`.flashcard__face--${side}`) };
}
//end AI made

//AI made : fait disparaître la carte en fondu avant de la retirer du DOM
export function removeFlashcardCard(card) {
    if (!card || card.classList.contains("flashcard--removing")) return;   // déjà en train de disparaître

    let removed = false;

    const finish = () => {
        if (removed) return;
        removed = true;
        card.remove();
    };

    // les transitions des faces et des commandes remontent aussi jusqu'à la carte : on attend celle de la carte elle-même
    card.addEventListener("transitionend", (e) => {
        if (e.target === card && e.propertyName === "opacity") finish();
    });

    card.classList.add("flashcard--removing");

    // filet de sécurité si aucune transition ne se déclenche (ex. prefers-reduced-motion)
    setTimeout(finish, 400);
}
//end AI made

// pour utiliser cette function il faut imperativement lui fournir un viewer tel que :
//  let element = document.createElement("div");
// let viewer = new Quill(element, { readOnly: true, modules: { toolbar: false } });
export function deltaToHTML (viewer, delta) {
    viewer.setContents(delta);
        
    const html = viewer.getSemanticHTML();

    return html.replaceAll("&nbsp;", " ");   // remet de vraies espaces, pour que le texte passe à la ligne
} 

export function renderFlashcard (packet) {
    let element = document.createElement("div");
    let viewer = new Quill(element, { readOnly: true, modules: { toolbar: false } });

    let flashcards = [];

    for (let data of packet) {
        const flashcardId = data.id
        const content = data.content;
        const frontDelta = content.front
        const backDelta = content.back


        const flashcard = document.createElement("article");
        flashcard.classList.add("flashcard");
        flashcard.dataset.flashcardId = flashcardId

        const flashcardInner = document.createElement("div");
        flashcardInner.classList.add("flashcard__inner");

        const front = document.createElement("div");
        front.classList.add("flashcard__face")
        front.classList.add("flashcard__face--front")
        front.innerHTML = deltaToHTML(viewer, frontDelta)

        const back = document.createElement("div");
        back.classList.add("flashcard__face");
        back.classList.add("flashcard__face--back");
        back.innerHTML = deltaToHTML(viewer, backDelta)

        flashcardInner.appendChild(front);
        flashcardInner.appendChild(back);

        const command = document.createElement("div");
        command.classList.add("flashcard__commands");

        const edit = document.createElement("div");
        edit.classList.add("flashcard__commands__button");
        edit.classList.add("flashcard__commands__button--edit");
        edit.dataset.flashcardCommandAction = "edit";
        //AI made : info-bulle native du navigateur au survol
        edit.title = "Modifier";
        //end AI made
        edit.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class=""><path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"></path><path d="m15 5 4 4"></path></svg>';

        const del = document.createElement("div");
        del.classList.add("flashcard__commands__button");
        del.classList.add("flashcard__commands__button--del");
        del.dataset.flashcardCommandAction = "del";
        //AI made
        del.title = "Supprimer";
        //end AI made
        del.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-trash2-icon lucide-trash-2"><path d="M10 11v6"></path><path d="M14 11v6"></path><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"></path><path d="M3 6h18"></path><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>';

        const copy = document.createElement("div");
        copy.classList.add("flashcard__commands__button");
        copy.classList.add("flashcard__commands__button--copy");
        copy.dataset.flashcardCommandAction = "copy";
        //AI made
        copy.title = "Dupliquer";
        //end AI made
        copy.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-copy preview-icon"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>';

        command.appendChild(edit);
        command.appendChild(del);
        command.appendChild(copy);

        flashcard.appendChild(flashcardInner);
        flashcard.appendChild(command);

        flashcards.push(flashcard);
    }

    return flashcards;
}


//AI made : formes du dossier (sans style ni couleur : tout est dans _folder.scss)
// gradientId doit être unique dans la page, d'où l'id du dossier dedans
function folderSvg(gradientId) {
    const frontShape = "M16 160 H224 A16 16 0 0 0 240 144 V4 A16 16 0 0 0 224 -12 H112 C98 -12 96 4 82 4 H16 A16 16 0 0 0 0 20 V144 A16 16 0 0 0 16 160 Z";

    return `
        <svg class="folder__svg" viewBox="-6 -20 252 184" aria-hidden="true">
            <defs>
                <linearGradient id="${gradientId}" x1="0" y1="1" x2="0" y2="0">
                    <stop offset="0" stop-color="#fff" stop-opacity="0"/>
                    <stop offset="1" stop-color="#fff" stop-opacity=".22"/>
                </linearGradient>
            </defs>
            <path class="folder__back" d="M16 160 H224 A16 16 0 0 0 240 144 V16 A16 16 0 0 0 224 0 H92 C78 0 78 -16 64 -16 H16 A16 16 0 0 0 0 0 V144 A16 16 0 0 0 16 160 Z"/>
            <rect class="folder__sheet folder__sheet--1" x="4" y="4" width="232" height="152" rx="16"/>
            <rect class="folder__sheet folder__sheet--2" x="4" y="4" width="232" height="152" rx="16"/>
            <rect class="folder__sheet folder__sheet--3" x="4" y="4" width="232" height="152" rx="16"/>
            <g class="folder__frontGroup">
                <path class="folder__front" d="${frontShape}"/>
                <path d="${frontShape}" fill="url(#${gradientId})"/>
            </g>
        </svg>`;
}
//end AI mad

// Crée le bouton d'un dossier ; le nom passe par textContent (jamais interprété comme du HTML)
export function renderFolder(packet) {
    let folders = [];
    for (let folder of packet) {
        const button = document.createElement("button");
        button.type = "button";
        button.classList.add("folder");
        button.dataset.folderId = folder.id;
        button.innerHTML = folderSvg(`folder-reflet-${folder.id}`);

        const title = document.createElement("span");
        title.classList.add("folder__title");
        title.textContent = folder.name;
        // nom complet en info-bulle, utile quand il est tronqué
        button.title = folder.name;

        button.appendChild(title);  

        folders.push(button);
    }
    
    return folders;
}
