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
