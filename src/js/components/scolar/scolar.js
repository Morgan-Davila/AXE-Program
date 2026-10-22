import { createDebug } from "../../debug.js";

const LOCAL_DEBUG = false;
const debug = createDebug(LOCAL_DEBUG);

debug("Chargement scolar.js"); //test

import { flashcardsArray } from "../../services/storage.js";
import {
    safeQuery,
    safeQueryAll,
    safeId,
    exists
} from "../../utils/dom.js"

import { flashcardBox, renderFlashcard } from "./scolarUI.js";


export function setupFlashcard () {
    //lancement des flashcards de test
    if (!exists(flashcardBox)) return;
    flashcardBox.replaceChildren(...renderFlashcard(flashcardsArray))
}


export function createFlashcard (content) {
    return {
        id: Date.now(),
        createdAt: Date.now(),
        content : content
    }
}

export function editDataFlashcard (content) {
    return {
        content : content
    }
}