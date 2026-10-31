import { createDebug } from "../../debug.js";

const LOCAL_DEBUG = false;
const debug = createDebug(LOCAL_DEBUG);

debug("Chargement storageFlashcards.js");


const FLASHCARDS_STORAGE_KEY = "flashcardsArray"

const DELETED_FLASHCARDS_STORAGE_KEY = "deletedFlashcardsArray";


//--------------------
//flashcard management
//--------------------

// Charger les flashcards
export function loadFlashcards() {
    return JSON.parse(localStorage.getItem(FLASHCARDS_STORAGE_KEY)) || [];
}

// Chargement initial
export let flashcardsArray = loadFlashcards();

// Sauvegarder
export function saveFlashcards() {
    localStorage.setItem(
        FLASHCARDS_STORAGE_KEY,
        JSON.stringify(flashcardsArray)
    );
}

// Ajouter une flashcard
export function addFlashcard(flashcard) {
    flashcardsArray.push(flashcard);

    saveFlashcards();
}


//AI made
// Charger les flashcards supprimées
export function loadDeletedFlashcards() {
    return JSON.parse(localStorage.getItem(DELETED_FLASHCARDS_STORAGE_KEY)) || [];
}

// Chargement initial
export let deletedFlashcardsArray = loadDeletedFlashcards();

// Sauvegarder les flashcards supprimées
export function saveDeletedFlashcards() {
    localStorage.setItem(
        DELETED_FLASHCARDS_STORAGE_KEY,
        JSON.stringify(deletedFlashcardsArray)
    );
}
//end AI made


// Supprimer une habitude
export function deleteFlashcard(id) {

    //AI made : archive la flashcard dans deletedFlashcardsArray avant de la retirer
    const flashcard = getFlashcard(id);
    if (!flashcard) return;

    deletedFlashcardsArray.push(flashcard);
    saveDeletedFlashcards();
    //end AI made

    flashcardsArray =flashcardsArray.filter(
        flashcard => flashcard.id !== id
    );

    saveFlashcards();
}


// Modifier une habitude
export function updateFlashcard(id, data) {

    const flashcard = flashcardsArray.find(
        flashcard => flashcard.id === id
    );

    if (!flashcard) return;

    Object.assign(flashcard, data);

    saveFlashcards();
}

export function getFlashcard(id) {
    return flashcardsArray.find(
        flashcard => flashcard.id === id
    );
}

export function clearFlashcards() {
    flashcardsArray = [];

    saveFlashcards();
}

// Les flashcards créées avant les dossiers n'ont pas de parentId :
// on considère qu'elles sont à la racine (null)
export function getFlashcardParentId(flashcard) {
    if (flashcard.parentId === undefined) {
        return null;
    }
    return flashcard.parentId;
}

export function getRootFlashcards () {
    return flashcardsArray.filter(f => f.parentId === null);
}

//AI made
// Supprime (en les archivant) toutes les flashcards rangées dans ces dossiers.
// Doit rester dans ce fichier : un module qui importe flashcardsArray ne peut pas le réassigner.
export function deleteFlashcardsInFolders(folderIds) {
    const isInFolders = flashcard => folderIds.includes(getFlashcardParentId(flashcard));

    deletedFlashcardsArray.push(...flashcardsArray.filter(isInFolders));
    flashcardsArray = flashcardsArray.filter(flashcard => !isInFolders(flashcard));

    saveFlashcards();
    saveDeletedFlashcards();
}
//end AI made