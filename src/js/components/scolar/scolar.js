import { createDebug } from "../../debug.js";

const LOCAL_DEBUG = false;
const debug = createDebug(LOCAL_DEBUG);

debug("Chargement scolar.js"); //test

import { 
    getRootFlashcards, 
    getRootFolders 
} from "../../services/storage.js";
import {
    safeQuery,
    safeQueryAll,
    safeId,
    exists
} from "../../utils/dom.js"

import { 
    clearFlashcardsBox, 
    flashcardBox, 
    getActualFolderId, 
    renderFlashcard, 
    renderFolder 
} from "./scolarUI.js";


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
    clearFlashcardsBox();
    
    setupRootFolders();
    setupRootFlashcard();
    
}
export function createFlashcard (content) {
    return {
        id: Date.now(),
        createdAt: Date.now(),
        content : content,
        parentId : getActualFolderId()
    }
}

export function editDataFlashcard (content) {
    return {
        content : content
    }
}