import { createDebug } from "../../debug.js";

const LOCAL_DEBUG = false;
const debug = createDebug(LOCAL_DEBUG);

debug("Chargement scolar.js"); //test

import { flashcardsArray, foldersArray, getRootFlashcards, getRootFolders } from "../../services/storage.js";
import {
    safeQuery,
    safeQueryAll,
    safeId,
    exists
} from "../../utils/dom.js"

import { flashcardBox, renderFlashcard, renderFolder } from "./scolarUI.js";


export function setupRootFlashcard () {
    //lancement des flashcards de test
    if (!exists(flashcardBox)) return;

    flashcardBox.append(...renderFlashcard(getRootFlashcards()))
}

export function setupRootFolders () {
    if (!exists(flashcardBox)) return;

    flashcardBox.append(...renderFolder(getRootFolders()))
}

export function setupRoot () {
    if (!exists(flashcardBox)) return;
    flashcardBox.innerHTML = ""
    
    setupRootFolders();
    setupRootFlashcard();
    
}
export function createFlashcard (content) {
    return {
        id: Date.now(),
        createdAt: Date.now(),
        content : content,
        parentId : null
    }
}

export function editDataFlashcard (content) {
    return {
        content : content
    }
}