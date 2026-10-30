//from debug.js
import  "./debug.js";

//AI made
import { setupThemeToggle } from "./components/theme/themeEvents.js";
setupThemeToggle();

//from utils/date.js

import { updateHeader, updateFooter } from "./utils/date.js";
updateHeader();
setInterval(updateHeader, 1000);

updateFooter();

import {
    getFrequency,
    setupTypePropositionSelection
} from "./components/habits/habits.js"

getFrequency();
setupTypePropositionSelection();

//from event.js
import {
    setupHabitsPopup,
    setupHabitsForm,
    setupPopupTypePicker,
    setupHabitDeleteButton,
    setupHabitEditButton
} from "./components/habits/habitsEvents.js";

setupHabitsPopup();
setupHabitsForm();
setupPopupTypePicker();

import {
    setupSearchTypeDropdown,
    setupSearchLaunch,
    setupCloseSearchButton,
    setupPopupOverlay
} from "./components/habits/popupSearch/habitsSearchEvents.js";


setupSearchTypeDropdown();
//AI made
setupSearchLaunch();
//AI made
setupCloseSearchButton();
setupPopupOverlay();



// global/habitsUI.js 
import {
    renderHabits,
    initTabs,
    renderMonthlyDays,
} from "./components/habits/habitsUI.js"


renderHabits();
initTabs();
renderMonthlyDays();




import { 
    loadDeletedHabits, 
    habitArray
} from "./services/storage/storageHabits.js";
loadDeletedHabits();

//AI made — avant tout rendu : remet à 0 les streaks des habitudes dont une échéance a été manquée
import { 
    resetMissedStreaks 
} from "./components/dashboard/dashboard.js";
resetMissedStreaks(habitArray);

import { 
    reactHabit 
} from "./components/dashboard/dashboard.js";

import { 
    setupRecallsCheckmarks 
} from "./components/dashboard/dashboardEvents.js";

//AI made
import { 
    setupCheckEffects, 
    setupMidnightRefresh 
} from "./components/dashboard/dashboardEvents.js";

setupCheckEffects();


document.addEventListener("DOMContentLoaded", () => {
    setupHabitDeleteButton();
    setupHabitEditButton();
    reactHabit(habitArray);
    setupRecallsCheckmarks();
    //AI made
    setupMidnightRefresh();
});

import { 
    setupRoot 
} from "./components/scolar/scolar.js";
setupRoot();

import {
    actualizeFolderBreadcrumb,
} from "./components/scolar/scolarUI.js";

actualizeFolderBreadcrumb();
import { 
    setupFlashcardPopup, 
    setupFlashcardSwitch, 
    setupFlashcardSaving, 
    setupFlashcardsCommandsButton, 
    setupTestFlashcardGeneration,
    setupFolderEvents,
    setupBreadCrumbButtonEvents,
    setupFlashcardFlip,
    setupNavChevrons
} from "./components/scolar/scolarEvents.js";
setupFlashcardFlip();
setupFlashcardPopup();
setupFlashcardSaving();
setupFlashcardSwitch();
setupFlashcardsCommandsButton();
setupTestFlashcardGeneration();
setupFolderEvents();
setupBreadCrumbButtonEvents();
setupNavChevrons();


import { setupEditor } from "./components/scolar/flashcardsEditor.js";
setupEditor();

//AI made
import { logStorageSize } from "./services/storage.js";
logStorageSize();
//end AI made


