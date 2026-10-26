import { createDebug } from "../debug.js";

const LOCAL_DEBUG = false;
const debug = createDebug(LOCAL_DEBUG);

debug("Chargement storage.js");


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
// Règle de base : chaque dossier et chaque flashcard a un parentId,
// qui est l'id du dossier qui le contient (null = à la racine).
// On n'enregistre jamais la liste des enfants : on la retrouve avec un filter.

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

// Trouver un dossier grâce à son id
export function getFolder(id) {
    return foldersArray.find(
        folder => folder.id === id
    );
}

// Modifier un dossier (ex : le renommer)
export function updateFolder(id, data) {

    const folder = getFolder(id);

    if (!folder) return;

    Object.assign(folder, data);

    // on note la date de la modification
    if (!folder.editList) {
        folder.editList = [];
    }
    folder.editList.push(Date.now());

    saveFolders();
}

// Les flashcards créées avant les dossiers n'ont pas de parentId :
// on considère qu'elles sont à la racine (null)
function getFlashcardParentId(flashcard) {
    if (flashcard.parentId === undefined) {
        return null;
    }
    return flashcard.parentId;
}

// Les sous-dossiers directs d'un dossier (null = racine)
export function getSubFolders(folderId) {
    return foldersArray.filter(
        folder => folder.parentId === folderId
    );
}

// Les flashcards rangées directement dans un dossier (null = racine)
export function getFolderFlashcards(folderId) {
    return flashcardsArray.filter(
        flashcard => getFlashcardParentId(flashcard) === folderId
    );
}

// Le chemin jusqu'à un dossier, pour le fil d'Ariane
// ex : getFolderPath("c3") -> [Maths, Algèbre, Chapitre 1]
export function getFolderPath(folderId) {
    const path = [];
    let current = getFolder(folderId);

    // on remonte de parent en parent jusqu'à la racine
    while (current) {
        path.unshift(current); // unshift = ajouter au début du tableau
        current = getFolder(current.parentId);
    }

    return path;
}

// Les ids de tous les sous-dossiers, sous-sous-dossiers, etc.
export function getAllSubFolderIds(folderId) {
    let ids = [];

    for (const subFolder of getSubFolders(folderId)) {
        ids.push(subFolder.id);

        // la fonction s'appelle elle-même pour descendre d'un niveau
        const deeperIds = getAllSubFolderIds(subFolder.id);
        ids = ids.concat(deeperIds);
    }

    return ids;
}

// Déplacer un dossier dans un autre (null = racine)
// renvoie true si le déplacement a marché, false sinon
export function moveFolder(folderId, targetFolderId) {

    // on ne peut pas mettre un dossier dans lui-même
    if (folderId === targetFolderId) {
        return false;
    }

    // ni dans un de ses propres sous-dossiers
    if (getAllSubFolderIds(folderId).includes(targetFolderId)) {
        return false;
    }

    // le dossier de destination doit exister (sauf la racine)
    if (targetFolderId !== null && !getFolder(targetFolderId)) {
        return false;
    }

    // seul le parentId change : tout son contenu le suit
    updateFolder(folderId, { parentId: targetFolderId });
    return true;
}

// Déplacer une flashcard dans un dossier (null = racine)
// renvoie true si le déplacement a marché, false sinon
export function moveFlashcard(flashcardId, targetFolderId) {

    // le dossier de destination doit exister (sauf la racine)
    if (targetFolderId !== null && !getFolder(targetFolderId)) {
        return false;
    }

    updateFlashcard(flashcardId, { parentId: targetFolderId });
    return true;
}

// Supprimer un dossier avec tout ce qu'il contient
export function deleteFolder(folderId) {

    if (!getFolder(folderId)) return;

    // 1. la liste de tous les dossiers à supprimer : lui + tous ses sous-dossiers
    const folderIdsToDelete = [folderId].concat(getAllSubFolderIds(folderId));

    // 2. on supprime les flashcards rangées dans ces dossiers
    for (const flashcard of flashcardsArray) {
        if (folderIdsToDelete.includes(getFlashcardParentId(flashcard))) {
            deletedFlashcardsArray.push(flashcard); // archive
        }
    }
    flashcardsArray = flashcardsArray.filter(
        flashcard => !folderIdsToDelete.includes(getFlashcardParentId(flashcard))
    );
    saveFlashcards();
    saveDeletedFlashcards();

    // 3. on supprime les dossiers eux-mêmes
    for (const folder of foldersArray) {
        if (folderIdsToDelete.includes(folder.id)) {
            deletedFoldersArray.push(folder); // archive
        }
    }
    foldersArray = foldersArray.filter(
        folder => !folderIdsToDelete.includes(folder.id)
    );
    saveFolders();
    saveDeletedFolders();
}

export function clearFolders() {
    foldersArray = [];

    saveFolders();
}
//end AI made


export function renameFolder (folderId, newName) {
    updateFolder(folderId, {name : newName} );
}

export function isRootFolder (folder) {
    if (!folder) return;
    if (folder.parentId === null) {
        return true;
    } else {
        return false;
    }
}

export function countAllFlashcards (folderId) {
    let total = getFolderFlashcards(folderId).length;

    for (const subFolder of getSubFolders(folderId)) {
        total += countAllFlashcards(subFolder.id);
    }
    
    return total;
}

export function getRootFlashcards () {
    return flashcardsArray.filter(f => f.parentId === null);
}

export function getRootFolders () {
    return foldersArray.filter(f => f.parentId === null)
}

//AI made
//--------------------
//taille du localStorage
//--------------------
// Affiche la taille de chaque clé et le total, si AXE.STORAGE_SIZE est à true.
// localStorage stocke en UTF-16 : 2 octets par caractère.
export function logStorageSize() {
    if (!window.AXE.STORAGE_SIZE) return;

    // une ligne par clé (le nom de la clé sert d'index), puis une ligne TOTAL
    const rows = {};
    let total = 0;
    for (const key of Object.keys(localStorage)) {
        const size = (key.length + localStorage.getItem(key).length) * 2;
        total += size;
        rows[key] = { "taille (Ko)": (size / 1024).toFixed(2) };
    }
    rows["TOTAL"] = { "taille (Ko)": (total / 1024).toFixed(2) };

    console.table(rows);
}
//end AI made