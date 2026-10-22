//AI made
import { createDebug } from "../debug.js";

const LOCAL_DEBUG = false;
const debug = createDebug(LOCAL_DEBUG);

debug("Chargement testData.js");

import { foldersArray, flashcardsArray, saveFolders, saveFlashcards } from "../services/storage.js";

//--------------------
//données de test (dossiers + flashcards)
//--------------------
// Toutes les données créées ici ont isTest: true, pour pouvoir les retirer
// avec clearTestData() sans toucher à tes vraies flashcards.
// Module non chargé par défaut : pour l'utiliser, l'importer dans main.js, par ex.
//   import { seedTestData } from "./testData/testData.js";
//   seedTestData();
// Une fois importé, aussi accessible depuis la console : AXE.seedTestData() / AXE.clearTestData()

// L'arbre de test, écrit imbriqué pour être lisible :
// chaque dossier a un nom, des cartes [recto, verso] et des sous-dossiers
const TEST_TREE = [
    { name: "Maths", cards: [], folders: [
        { name: "Algèbre", cards: [
            ["Développer (a + b)²", "a² + 2ab + b²"]
        ], folders: [
            { name: "Équations", cards: [
                ["Résoudre 2x + 3 = 11", "x = 4"],
                ["Qu'est-ce qu'une équation du premier degré ?", "Une équation de la forme ax + b = 0, avec a ≠ 0"],
                ["Formule du discriminant", "Δ = b² - 4ac"]
            ], folders: [] },
            { name: "Identités remarquables", cards: [
                ["(a - b)²", "a² - 2ab + b²"],
                ["(a + b)(a - b)", "a² - b²"]
            ], folders: [] }
        ] },
        { name: "Géométrie", cards: [
            ["Théorème de Pythagore", "Dans un triangle rectangle : a² + b² = c² (c = hypoténuse)"],
            ["Aire d'un disque", "π × r²"],
            ["Somme des angles d'un triangle", "180°"]
        ], folders: [] }
    ] },
    { name: "Histoire", cards: [], folders: [
        { name: "Révolution française", cards: [
            ["Date de la prise de la Bastille", "14 juillet 1789"],
            ["Que proclame la DDHC ?", "Les droits naturels de l'Homme : liberté, propriété, sûreté, résistance à l'oppression"],
            ["Date de l'abolition des privilèges", "Nuit du 4 août 1789"]
        ], folders: [] },
        { name: "Seconde Guerre mondiale", cards: [
            ["Date du débarquement en Normandie", "6 juin 1944"],
            ["Date de l'armistice de la Seconde Guerre mondiale en Europe", "8 mai 1945"]
        ], folders: [] }
    ] },
    { name: "Anglais", cards: [], folders: [
        { name: "Vocabulaire", cards: [
            ["Une bibliothèque", "A library"],
            ["Un emploi du temps", "A timetable"],
            ["Réussir (un examen)", "To pass (an exam)"]
        ], folders: [
            { name: "Verbes irréguliers", cards: [
                ["To go", "went / gone"],
                ["To take", "took / taken"],
                ["To write", "wrote / written"]
            ], folders: [] }
        ] }
    ] },
    { name: "Physique", cards: [], folders: [] } // dossier vide, pour tester l'affichage
];

// cartes de test rangées directement à la racine
const TEST_ROOT_CARDS = [
    ["Capitale de l'Australie", "Canberra"],
    ["Combien d'os chez l'adulte ?", "206"]
];

// Les flashcards sont stockées au format Delta de Quill
function textToDelta(text) {
    return { ops: [{ insert: text + "\n" }] };
}

// Crée une flashcard de test dans un dossier (null = racine)
// id numérique et unique : Date.now() seul donnerait le même id à toutes
// les cartes créées dans la même milliseconde, d'où le + flashcardsArray.length
function createTestFlashcard([front, back], parentId) {
    flashcardsArray.push({
        id: Date.now() + flashcardsArray.length,
        createdAt: Date.now(),
        content: { front: textToDelta(front), back: textToDelta(back) },
        parentId: parentId,
        isTest: true
    });
}

// Parcourt l'arbre de test et crée chaque dossier avec le bon parentId
// (la fonction s'appelle elle-même pour les sous-dossiers)
function createTestFolders(treeFolders, parentId) {
    for (const treeFolder of treeFolders) {
        const folder = {
            id: crypto.randomUUID(),
            name: treeFolder.name,
            parentId: parentId,
            createdAt: Date.now(),
            editList: [],
            isTest: true
        };
        foldersArray.push(folder);

        for (const card of treeFolder.cards) {
            createTestFlashcard(card, folder.id);
        }

        createTestFolders(treeFolder.folders, folder.id);
    }
}

// Ajoute les données de test (une seule fois : ne fait rien si elles existent déjà)
export function seedTestData() {
    const alreadySeeded = foldersArray.some(folder => folder.isTest);
    if (alreadySeeded) {
        debug("Données de test déjà présentes");
        return;
    }

    createTestFolders(TEST_TREE, null);
    for (const card of TEST_ROOT_CARDS) {
        createTestFlashcard(card, null);
    }

    saveFolders();
    saveFlashcards();
    debug("Données de test ajoutées");
}

// les tableaux importés ne peuvent pas être réassignés ici : on les vide sur place
function removeTestItems(array) {
    for (let i = array.length - 1; i >= 0; i--) {
        if (array[i].isTest) array.splice(i, 1);
    }
}

// Retire uniquement les données de test
export function clearTestData() {
    removeTestItems(foldersArray);
    removeTestItems(flashcardsArray);

    saveFolders();
    saveFlashcards();
}

// accessibles depuis la console du navigateur
window.AXE.seedTestData = seedTestData;
window.AXE.clearTestData = clearTestData;
//end AI made
