const LOCAL_DEBUG = true;

debug(LOCAL_DEBUG, "Chargement scolarEvents.js"); //test

import {
    flashcardCreateButton,
    flashcardPopupOverlay,
    showFlashcardPopup,
    closeFlashcardPopup,
    isFlashcardPopupOpen,
    editableFlashcard,
    flashcardSwitchButton,
    flipFlashcard,
    saveFlashcardButton,
    flashcardLab,
    setupFlashcardFlip,
    flashcardBox
} from "./scolarUI.js";

import { showEditorFace, editors, resetFlashcardEditor, checkIfNotEmpty } from "./flashcardsEditor.js";
import { addFlashcard, getFlashcard } from "../../services/storage.js";
import { createFlashcard, setupFlashcard } from "./scolar.js";
import { showError } from "../../utils/error.js";

const EMPTY_FLASHCARD_MESSAGE = "Les deux faces de la flashcard doivent être remplies.";
let flashcardPopupMode = "create";

//AI made : le bouton "Switch" retourne la carte éditable et passe l'éditeur sur l'autre face
export function setupFlashcardSwitch() {
    if (!flashcardSwitchButton || !editableFlashcard) return;

    flashcardSwitchButton.addEventListener("click", () => {
        const isBack = flipFlashcard(editableFlashcard, "editableFlashcard");
        flashcardSwitchButton.setAttribute("aria-pressed", String(isBack));
        showEditorFace(isBack ? "back" : "front");
    });
}


//AI made : ouverture/fermeture de la popup flashcard
export function setupFlashcardPopup() {

    // ouvrir la popup
    if (flashcardCreateButton) {
        flashcardCreateButton.addEventListener("click", () => {
            showFlashcardPopup();
        });
    }

    // fermer la popup en cliquant sur l'overlay (pas sur la popup elle-même)
    if (!flashcardPopupOverlay) return;

    flashcardPopupOverlay.addEventListener("click", (event) => {
        if (event.target === flashcardPopupOverlay) {
            closeFlashcardPopup();
        }
    });

    // fermer la popup avec Échap
    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && isFlashcardPopupOpen()) {
            closeFlashcardPopup();
        }
    });
}




export function setupFlashcardSaving () {
    if (!saveFlashcardButton) return;

    saveFlashcardButton.addEventListener("click", () => {
        const content = {
            front: editors.front.getContents(),
            back: editors.back.getContents()
        };
        if (checkIfNotEmpty()) {

            
            const flashcard = createFlashcard(content);
            addFlashcard(flashcard);
            closeFlashcardPopup();
            resetFlashcardEditor();
            setupFlashcard();
            setupFlashcardFlip();
        } else {
            showError(flashcardLab, EMPTY_FLASHCARD_MESSAGE);
        }
        
    });
}


export function setupFlashcardsCommandsButton () {
    flashcardBox.addEventListener("click", (event) => {

        const button = event.target.closest(".flashcard__commands__button");
        if (!button) return;

        const card = event.target.closest(".flashcard");
        const id = Number(card.dataset.flashcardId);
        const action = button.dataset.flashcardCommandAction;

        if (action === "edit") {
            flashcardPopupMode = "edit";

            const flashcard = getFlashcard(id);

            
            resetFlashcardEditor();
            editors.front.setContents(flashcard.content.front);
            editors.back.setContents(flashcard.content.back);

            showFlashcardPopup();
        }

        if (action === "del") {

        }

        if (action === "copy") {
            
        }
    })
}