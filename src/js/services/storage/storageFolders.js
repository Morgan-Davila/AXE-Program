import { createDebug } from "../../debug.js";

const LOCAL_DEBUG = false;
const debug = createDebug(LOCAL_DEBUG);

debug("Chargement storageFolders.js");

import {
    flashcardsArray,
    getFlashcardParentId,
    updateFlashcard,
    deleteFlashcardsInFolders
} from "./storageFlashcards.js";


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
    if (id === null || id === "null") return null;

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

// Les sous-dossiers directs d'un dossier (null = racine)
export function getSubFolders(folderId) {
    return foldersArray.filter(
        folder => folder.parentId === folderId
    );
}

//human made
export function getParentFolderId (folderId) {
    const folder = getFolder(folderId);

    //if (folder === null) return null;
    debug(folder)
    const parent = folder.parentId ?? null;

    return parent;
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

//AI made
// Transforme un tableau d'ids de dossiers en tableau de noms (null = "Racine")
// ex : getFolderNames([null, "a1", "b2"]) -> ["Racine", "Maths", "Algèbre"]
export function getFolderNames(folderIds) {
    return folderIds.map(id => {
        if (id === null) return "Racine";

        const folder = getFolder(id);
        // id inconnu (dossier supprimé ?) : on le signale au lieu de planter
        if (!folder) {
            debug("getFolderNames : dossier introuvable", id);
            return "(introuvable)";
        }

        return folder.name;
    });
}
//end AI made

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
//AI made
// Les ids de tous les dossiers parents, de la racine (null) jusqu'au parent direct
// ex : getAllParentFolderIds("chapitre1") -> [null, "maths", "algebre"]
export function getAllParentFolderIds (folderId) {
    // cas d'arrêt : la racine n'a pas de parent
    if (folderId === null) return [];

    const parentId = getParentFolderId(folderId);

    // la fonction s'appelle elle-même pour remonter d'un niveau,
    // puis ajoute le parent direct à la fin
    return getAllParentFolderIds(parentId).concat(parentId);
}
//end AI made

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
    // (fait dans storageFlashcards.js : flashcardsArray ne peut être réassigné que là-bas)
    deleteFlashcardsInFolders(folderIdsToDelete);

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

export function getRootFolders () {
    return foldersArray.filter(f => f.parentId === null)
}
