const LOCAL_DEBUG = false;

debug(LOCAL_DEBUG, "Chargement storage.js");


// services/storage.js

const STORAGE_KEY = "habitArray";
const DELETED_STORAGE_KEY = "deletedHabitsArray";
const FLASHCARDS_STORAGE_KEY = "flashcardsArray"
//AI made
const DELETED_FLASHCARDS_STORAGE_KEY = "deletedFlashcardsArray";
//end AI made



// Charger les habitudes
export function loadHabits() {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
}

// Chargement initial
export let habitArray = loadHabits();

// Sauvegarder
export function saveHabits() {
    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(habitArray)
    );
}



// Charger les habitudes supprimées
export function loadDeletedHabits() {
    return JSON.parse(localStorage.getItem(DELETED_STORAGE_KEY)) || [];
}

// Chargement initial
export let deletedHabitsArray = loadDeletedHabits();

// Sauvegarder les habitudes supprimées
export function saveDeletedHabits() {
    localStorage.setItem(
        DELETED_STORAGE_KEY,
        JSON.stringify(deletedHabitsArray)
    );
}



// Ajouter une habitude
export function addHabit(habit) {
    habitArray.push(habit);

    saveHabits();
}



// Supprimer une habitude
export function deleteHabit(id) {

    //AI made : archive l'habitude dans deletedHabitsArray avant de la retirer
    const habit = getHabit(id);
    if (!habit) return;

    deletedHabitsArray.push(habit);
    saveDeletedHabits();
    //end AI made

    habitArray = habitArray.filter(
        habit => habit.id !== id
    );

    saveHabits();
}



// Modifier une habitude
export function updateHabit(id, data) {

    const habit = habitArray.find(
        habit => habit.id === id
    );

    if (!habit) return;

    Object.assign(habit, data);

    saveHabits();
}

export function getHabit(id) {
    return habitArray.find(
        habit => habit.id === id
    );
}

export function clearHabits() {
    habitArray = [];

    saveHabits();
}


//AI made
// ---- Thème clair/sombre ----
// même clé que le script anti-flash inline dans le <head> des pages
const THEME_KEY = "axeTheme";

//AI made
// "light" par défaut : seul un choix explicite de l'utilisateur peut donner "dark"
export function loadTheme() {
    return localStorage.getItem(THEME_KEY) === "dark" ? "dark" : "light";
}

//AI made
export function saveTheme(theme) {
    localStorage.setItem(THEME_KEY, theme);
}


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


//AI made
//--------------------
//folder management
//--------------------
// Les dossiers sont stockés à plat : chaque dossier (et chaque flashcard) connaît
// seulement son parentId (null = racine). Les enfants ne sont jamais stockés,
// ils sont recalculés à la demande (cf. getFolderChildren).

const FOLDERS_STORAGE_KEY = "foldersArray";
const DELETED_FOLDERS_STORAGE_KEY = "deletedFoldersArray";

// Charger les dossiers
export function loadFolders() {
    return JSON.parse(localStorage.getItem(FOLDERS_STORAGE_KEY)) || [];
}

// Chargement initial
export let foldersArray = loadFolders();

// Sauvegarder
export function saveFolders() {
    localStorage.setItem(
        FOLDERS_STORAGE_KEY,
        JSON.stringify(foldersArray)
    );
}

// Charger les dossiers supprimés
export function loadDeletedFolders() {
    return JSON.parse(localStorage.getItem(DELETED_FOLDERS_STORAGE_KEY)) || [];
}

// Chargement initial
export let deletedFoldersArray = loadDeletedFolders();

// Sauvegarder les dossiers supprimés
export function saveDeletedFolders() {
    localStorage.setItem(
        DELETED_FOLDERS_STORAGE_KEY,
        JSON.stringify(deletedFoldersArray)
    );
}

// Ajouter un dossier
export function addFolder(folder) {
    foldersArray.push(folder);

    saveFolders();
}

export function getFolder(id) {
    return foldersArray.find(
        folder => folder.id === id
    );
}

// Modifier un dossier (renommage...) ; la date est ajoutée à son editList
export function updateFolder(id, data) {

    const folder = getFolder(id);

    if (!folder) return;

    Object.assign(folder, data);
    folder.editList = [...(folder.editList ?? []), Date.now()];

    saveFolders();
}

// parentId d'une flashcard : les anciennes cartes sans parentId sont à la racine
function getFlashcardParentId(flashcard) {
    return flashcard.parentId ?? null;
}

// Contenu direct d'un dossier (null = racine), ce qu'affiche l'explorateur
export function getFolderChildren(folderId = null) {
    return {
        folders: foldersArray.filter(folder => folder.parentId === folderId),
        flashcards: flashcardsArray.filter(flashcard => getFlashcardParentId(flashcard) === folderId)
    };
}

// Chemin depuis la racine jusqu'au dossier inclus, pour le fil d'Ariane
// ex : getFolderPath("c3") -> [Maths, Algèbre, Chapitre 1]
export function getFolderPath(folderId) {
    const path = [];
    const visited = new Set(); // sécurité : évite une boucle infinie si les données sont corrompues
    let current = getFolder(folderId);

    while (current && !visited.has(current.id)) {
        visited.add(current.id);
        path.unshift(current);
        current = getFolder(current.parentId);
    }

    return path;
}

// Ids de tous les sous-dossiers, à toutes les profondeurs (le dossier lui-même exclu)
export function getDescendantFolderIds(folderId) {
    const ids = [];
    const queue = [folderId];

    while (queue.length) {
        const parentId = queue.shift();
        for (const folder of foldersArray) {
            if (folder.parentId === parentId && !ids.includes(folder.id)) {
                ids.push(folder.id);
                queue.push(folder.id);
            }
        }
    }

    return ids;
}

// Un dossier ne peut pas aller dans lui-même ni dans un de ses descendants
export function canMoveFolder(folderId, targetFolderId) {
    if (targetFolderId === null) return true;
    if (!getFolder(targetFolderId)) return false;

    return folderId !== targetFolderId
        && !getDescendantFolderIds(folderId).includes(targetFolderId);
}

// Déplacer un dossier : seul son parentId change, son contenu le suit
export function moveFolder(folderId, targetFolderId = null) {
    if (!getFolder(folderId) || !canMoveFolder(folderId, targetFolderId)) {
        debug(LOCAL_DEBUG, "Déplacement de dossier impossible", folderId, "->", targetFolderId);
        return false;
    }

    updateFolder(folderId, { parentId: targetFolderId });
    return true;
}

// Déplacer une flashcard dans un dossier (null = racine)
export function moveFlashcard(flashcardId, targetFolderId = null) {
    if (!getFlashcard(flashcardId) || (targetFolderId !== null && !getFolder(targetFolderId))) {
        debug(LOCAL_DEBUG, "Déplacement de flashcard impossible", flashcardId, "->", targetFolderId);
        return false;
    }

    updateFlashcard(flashcardId, { parentId: targetFolderId });
    return true;
}

// Supprimer un dossier avec tout son contenu (sous-dossiers + flashcards),
// archivés dans les tableaux de supprimés comme pour deleteFlashcard
export function deleteFolder(folderId) {
    if (!getFolder(folderId)) return;

    const removedFolderIds = [folderId, ...getDescendantFolderIds(folderId)];

    const removedFlashcards = flashcardsArray.filter(
        flashcard => removedFolderIds.includes(getFlashcardParentId(flashcard))
    );
    deletedFlashcardsArray.push(...removedFlashcards);
    saveDeletedFlashcards();

    flashcardsArray = flashcardsArray.filter(
        flashcard => !removedFlashcards.includes(flashcard)
    );
    saveFlashcards();

    deletedFoldersArray.push(...foldersArray.filter(folder => removedFolderIds.includes(folder.id)));
    saveDeletedFolders();

    foldersArray = foldersArray.filter(
        folder => !removedFolderIds.includes(folder.id)
    );
    saveFolders();
}

export function clearFolders() {
    foldersArray = [];

    saveFolders();
}
//end AI made
