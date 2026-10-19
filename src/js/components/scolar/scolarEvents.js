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
    flashcardBox,
    renderFlashcard,
    //AI made
    removeFlashcardCard,
    getVisibleFlashcardFace,
    flashcardTestButton
} from "./scolarUI.js";

import { 
    showEditorFace, 
    editors, 
    resetFlashcardEditor, 
    checkIfNotEmpty 
} from "./flashcardsEditor.js";

import { 
    addFlashcard, 
    deleteFlashcard, 
    flashcardsArray, 
    getFlashcard, 
    updateFlashcard 
} from "../../services/storage.js";

import { 
    createFlashcard, 
    editDataFlashcard, 
    setupFlashcard 
} from "./scolar.js";

import { 
    showError, 
    showErrorPopup, 
    showSuccessPopup 
} from "../../utils/error.js";

//AI made : pas de bundler, donc chemin relatif vers node_modules (version française uniquement)
import { faker } from "../../../../node_modules/@faker-js/faker/dist/locale/fr.js";
//end AI made

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
            flashcardPopupMode = "create";
        resetFlashcardEditor();
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

            switch (flashcardPopupMode) {
                case "create" : {
                    const flashcard = createFlashcard(content);
                    addFlashcard(flashcard);
                    closeFlashcardPopup();
                    resetFlashcardEditor();
                    setupFlashcard();
                    setupFlashcardFlip();

                    break;
                }

                case "edit" : {
                    const actualId = Number(saveFlashcardButton.dataset.actualId);
                    const flashcard = editDataFlashcard(content);

                    updateFlashcard(actualId, flashcard);

                    setupFlashcard();
                    setupFlashcardFlip();
                    closeFlashcardPopup();
                    resetFlashcardEditor();


                    saveFlashcardButton.dataset.actualId = null;
                    flashcardPopupMode = "create";
                    break;
                }
            }
            
            
        } else {
            showError(flashcardLab, EMPTY_FLASHCARD_MESSAGE);
        }
        
    });
}


export function setupFlashcardsCommandsButton () {
    if (!flashcardBox) return;
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
            saveFlashcardButton.dataset.actualId = id;
        }

        if (action === "del") {
            deleteFlashcard(id);
            //AI made : suppression animée ; les autres cartes ne sont pas re-rendues, elles gardent donc leurs listeners
            removeFlashcardCard(card);
            //end AI made
        }

        if (action === "copy") {
            //AI made
            copyFlashcardFace(card);
            //end AI made
        }
    })
}

//AI made : copie la face visible de la carte dans le presse-papier, avec sa mise en forme quand c'est possible
async function copyFlashcardFace(card) {
    const { side, element } = getVisibleFlashcardFace(card);
    if (!element) return;

    const html = element.innerHTML;
    const text = element.innerText;

    try {
        if (window.ClipboardItem) {
            // text/html garde le gras, les couleurs… à coller dans un éditeur ; text/plain sert partout ailleurs
            await navigator.clipboard.write([
                new ClipboardItem({
                    "text/html": new Blob([html], { type: "text/html" }),
                    "text/plain": new Blob([text], { type: "text/plain" })
                })
            ]);
        } else {
            await navigator.clipboard.writeText(text);
        }

        showSuccessPopup(side === "back" ? "Verso copié" : "Recto copié");
    } catch (error) {
        // presse-papier refusé (page non sécurisée, permission refusée…)
        debug(LOCAL_DEBUG, error);
        showErrorPopup("Impossible de copier la flashcard.");
    }
}
//end AI made



export function setupTestFlashcardGeneration () {

    if (!flashcardTestButton) return;
    
    flashcardTestButton.addEventListener("click", (e) => {
        debug(LOCAL_DEBUG, faker.word.noun())
        debug(LOCAL_DEBUG, faker.lorem.paragraph())

        const content = {
            front : editors.front.setText(faker.word.noun()),
            back : editors.back.setText(faker.lorem.paragraph())
        }

        const flashcard = createFlashcard(content);
        addFlashcard(flashcard);
        resetFlashcardEditor();
        setupFlashcard();
        setupFlashcardFlip();
    });
}