const LOCAL_DEBUG = false;

debug(LOCAL_DEBUG, "Chargement scolar.js"); //test

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
    
    flashcardBox.replaceChildren(...renderFlashcard(flashcardsArray))
}


export function createFlashcard (content) {
    return {
        id: Date.now(),
        createdAt: Date.now(),
        content : content
    }
}