const LOCAL_DEBUG = false;

debug(LOCAL_DEBUG, "Chargement scolarUI.js"); //test

import {
    safeQuery,
    safeQueryAll,
    safeId,
    exists
} from "../../utils/dom.js"

export const flashcardBox = safeQuery(".flashcardBox");

export const saveFlashcardButton = safeQuery(".flashcardLab__saveButton");

//AI made : références de la popup flashcard
export const flashcardCreateButton = safeQuery(".flashcardCreateButton");
export const flashcardPopupOverlay = safeQuery(".overlayPopupFlashcardLab");

//human made
export const flashcardLab = safeQuery(".popupFlashcardLab");

//AI made : carte éditable de la popup et bouton qui la retourne
export const editableFlashcard = safeQuery(".editableFlashcard");
export const flashcardSwitchButton = safeQuery(".flashcardSwitch");

//AI made
export function openFlashcardPopup() {
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


export function renderTestFlashCards (destination, amount) {
    
    for (let i = 0; i < amount ; i ++) {

        let flashcard = document.createElement("article");
        flashcard.classList.add("flashcard");

        let flashcardInner = document.createElement("div");
        flashcardInner.classList.add("flashcard__inner");

        let flashcardFront = document.createElement("div");
        flashcardFront.classList.add("flashcard__face");
        flashcardFront.classList.add("flashcard__face--front");
        flashcardFront.textContent = "Recto";

        let flashcardBack = document.createElement("div");
        flashcardBack.classList.add("flashcard__face");
        flashcardBack.classList.add("flashcard__face--back");
        flashcardBack.textContent = "Verso";

        flashcardInner.appendChild(flashcardFront);
        flashcardInner.appendChild(flashcardBack);

        flashcard.appendChild(flashcardInner);

        destination.appendChild(flashcard)
    }

}


//AI made : retourne une carte ; block = classe BEM de la carte ("flashcard" ou "editableFlashcard")
// renvoie true si la carte montre maintenant son verso
export function flipFlashcard(card, block = "flashcard") {
    return card.classList.toggle(`${block}--flipped`);
}

export function setupFlashcardFlip() {
    const cards = safeQueryAll(".flashcard");

    cards.forEach(card => {
        card.addEventListener("click", () => {
            flipFlashcard(card);
        });
    });
}


// renderFlashcards (packet) {
//     for (let flashcard in packet) {

//     }
// } 