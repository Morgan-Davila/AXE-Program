import { createDebug } from "../../debug.js";

const LOCAL_DEBUG = true;
const debug = createDebug(LOCAL_DEBUG);

debug("Chargement scolarEvents.js"); //test

import {
    flashcardCreateButton,
    flashcardPopupOverlay,
    showFlashcardPopup,
    closeFlashcardPopup,
    isFlashcardPopupOpen,
    editableFlashcard,
    flashcardSwitchButton,
    flipFlashcard,
    saveFlashcardButton,
    flashcardLab,
    hideCommandsDuringFlip,
    flashcardBox,
    removeFlashcardCard,
    removeFolderElement,
    getVisibleFlashcardFace,
    flashcardTestButton,
    displayFolder,
    scolarToolbar,
    getActualFolderId,
    scolarNavChevrons,
    HISTORIC,
    cursor,
    setCursor,
    actualizeHistoricAndCursor,
    folderCreateButton,
    renderEditableFolder,
    setFocusOnInputs,
    collectDataEditableFolder,
    replaceChampofAFolder,
    knowEditableFolderType,
    isDuplicate,
    selectFolder,
    clearSelection
} from "./scolarUI.js";

import { 
    showEditorFace, 
    editors, 
    resetFlashcardEditor, 
    checkIfNotEmpty 
} from "./flashcardsEditor.js";

import { 
    addFlashcard, 
    deleteFlashcard, 
    getFlashcard, 
    updateFlashcard 
} from "../../services/storage/storageFlashcards.js";

import { 
    addFolder,
    deleteFolder,
    getFolder, 
    getFolderNames, 
    updateFolder
} from "../../services/storage/storageFolders.js";

import { 
    createFlashcard, 
    createFolder, 
    editDataFlashcard, 
    editFolderName, 
    setupRoot
} from "./scolar.js";

import { 
    showError, 
    showErrorPopup, 
    showSuccessPopup 
} from "../../utils/error.js";

//AI made : pas de bundler, donc chemin relatif vers node_modules (version française uniquement)
import { faker } from "../../../../node_modules/@faker-js/faker/dist/locale/fr.js";
//end AI made

import { 
    safeQueryAll, 
    exists, 
    safeQuery
} from "../../utils/dom.js";



const EMPTY_FLASHCARD_MESSAGE = "Les deux faces de la flashcard doivent être remplies.";
let flashcardPopupMode = "create";

//AI made : le bouton "Switch" retourne la carte éditable et passe l'éditeur sur l'autre face
export function setupFlashcardSwitch() {
    if (!flashcardSwitchButton || !editableFlashcard) return;

    flashcardSwitchButton.addEventListener("click", () => {
        const isBack = flipFlashcard(editableFlashcard, "editableFlashcard");
        flashcardSwitchButton.setAttribute("aria-pressed", String(isBack));
        showEditorFace(isBack ? "back" : "front");
    });
}

export function setupFlashcardFlip() {

    if (!flashcardBox) return;
    flashcardBox.addEventListener("click", (e) => {
        if (e.target.closest(".flashcard__commands")) return;

        const card = e.target.closest(".flashcard");
        if(!card) return;


        flipFlashcard(card);
        hideCommandsDuringFlip(card);
    })
}


//AI made : ouverture/fermeture de la popup flashcard
export function setupFlashcardPopup() {

    // ouvrir la popup
    if (flashcardCreateButton) {
        flashcardCreateButton.addEventListener("click", () => {
            flashcardPopupMode = "create";
        resetFlashcardEditor();
            showFlashcardPopup();
        });
    }

    // fermer la popup en cliquant sur l'overlay (pas sur la popup elle-même)
    if (!flashcardPopupOverlay) return;

    flashcardPopupOverlay.addEventListener("click", (event) => {
        if (event.target === flashcardPopupOverlay) {
            closeFlashcardPopup();
        }
    });

    // fermer la popup avec Échap
    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && isFlashcardPopupOpen()) {
            closeFlashcardPopup();
        }
    });
}




export function setupFlashcardSaving () {
    if (!saveFlashcardButton) return;

    saveFlashcardButton.addEventListener("click", () => {
        const content = {
            front: editors.front.getContents(),
            back: editors.back.getContents()
        };

        const folderId = getActualFolderId();

        if (checkIfNotEmpty()) {

            switch (flashcardPopupMode) {
                case "create" : {
                    const flashcard = createFlashcard(content);
                    addFlashcard(flashcard);
                    closeFlashcardPopup();
                    resetFlashcardEditor();
                    displayFolder(folderId);

                    break;
                }

                case "edit" : {
                    const actualId = Number(saveFlashcardButton.dataset.actualId);
                    const flashcard = editDataFlashcard(content);

                    updateFlashcard(actualId, flashcard);

                    displayFolder(folderId);
                    closeFlashcardPopup();
                    resetFlashcardEditor();


                    saveFlashcardButton.dataset.actualId = null;
                    flashcardPopupMode = "create";
                    break;
                }
            }
            
            
        } else {
            showError(flashcardLab, EMPTY_FLASHCARD_MESSAGE);
        }
        
    });
}


export function setupFlashcardsCommandsButton () {
    if (!flashcardBox) return;
    flashcardBox.addEventListener("click", (event) => {

        const button = event.target.closest(".flashcard__commands__button");
        if (!button) return;

        const card = event.target.closest(".flashcard");
        const id = Number(card.dataset.flashcardId);
        const action = button.dataset.flashcardCommandAction;

        if (action === "edit") {
            flashcardPopupMode = "edit";

            const flashcard = getFlashcard(id);

            
            resetFlashcardEditor();
            editors.front.setContents(flashcard.content.front);
            editors.back.setContents(flashcard.content.back);

            showFlashcardPopup();
            saveFlashcardButton.dataset.actualId = id;
        }

        if (action === "del") {
            deleteFlashcard(id);
            //AI made : suppression animée ; les autres cartes ne sont pas re-rendues, elles gardent donc leurs listeners
            removeFlashcardCard(card);
            //end AI made
        }

        if (action === "copy") {
            //AI made
            copyFlashcardFace(card);
            //end AI made
        }
    })
}

//AI made : copie la face visible de la carte dans le presse-papier, avec sa mise en forme quand c'est possible
async function copyFlashcardFace(card) {
    const { side, element } = getVisibleFlashcardFace(card);
    if (!element) return;

    const html = element.innerHTML;
    const text = element.innerText;

    try {
        if (window.ClipboardItem) {
            // text/html garde le gras, les couleurs… à coller dans un éditeur ; text/plain sert partout ailleurs
            await navigator.clipboard.write([
                new ClipboardItem({
                    "text/html": new Blob([html], { type: "text/html" }),
                    "text/plain": new Blob([text], { type: "text/plain" })
                })
            ]);
        } else {
            await navigator.clipboard.writeText(text);
        }

        showSuccessPopup(side === "back" ? "Verso copié" : "Recto copié");
    } catch (error) {
        // presse-papier refusé (page non sécurisée, permission refusée…)
        debug(error);
        showErrorPopup("Impossible de copier la flashcard.");
    }
}
//end AI made

export function setupTestFlashcardGeneration () {

    if (!flashcardTestButton) return;
    
    flashcardTestButton.addEventListener("click", (e) => {

        const content = {
            front : editors.front.setText(faker.word.noun()),
            back : editors.back.setText(faker.lorem.paragraph())
        }
        const folderId = getActualFolderId();
        const flashcard = createFlashcard(content);
        addFlashcard(flashcard);
        resetFlashcardEditor();
        displayFolder(folderId);
        
    });
}

//gère l'entrée, l'edit et le del d'un folder
export function setupFolderEvents () {
    if (!exists(flashcardBox)) return;

    flashcardBox.addEventListener("click", (e) => {
        const folder = e.target.closest(".folder");
        if (!folder) return;
        
        if (e.shiftKey) { 
            selectFolder(folder)


            return
        } else { 

            if (e.target.closest('.folder__commands__button--edit')) {
                replaceChampofAFolder(folder);
                folder.dataset.isEditable = true;
                folder.dataset.isEditing = true;
                setFocusOnInputs(folder);
                return;

            } else if (e.target.closest('.folder__commands__button--del')){
                const folderId = folder.dataset.folderId;
                deleteFolder(folderId);
                //AI made : suppression animée, comme pour les flashcards (pas besoin de re-rendre toute la boîte)
                removeFolderElement(folder);
                //end AI made
                return
            }
            clearSelection();
            selectFolder(folder);
        }
    })

    flashcardBox.addEventListener("dblclick", (e) => {
        const folder = e.target.closest(".folder");
        if (!folder) return;

        //si le click est réelement sur un dossier, alors on entre dedans
        const isEditable = folder.dataset.isEditable;
        if (isEditable === "true") return;

        const folderId = folder.dataset.folderId;

        displayFolder(folderId);
        actualizeHistoricAndCursor(folderId); // trouver un moyen de distinguer les diplsayFolder de deplacement dans l'historic et ceux de nouvelles entrées
    })
}


export function setupBreadCrumbButtonEvents () {
    if (!exists(scolarToolbar)) return ;

    scolarToolbar.addEventListener("click", (e) => {
        const button = e.target.closest(".breadcrumb__link");
        if (!button) return;

        let folderId = button.dataset.folderId;
        if (folderId === "null") {
            folderId = null
        };

        //AI made : on vérifie avant d'afficher : si c'est le dossier déjà affiché, rien à re-rendre ni à ajouter à l'historique
        if (isDuplicate(folderId)) {
            return
        }

        displayFolder(folderId);
        actualizeHistoricAndCursor(folderId);
        //end AI made

    })
}

export function setupNavChevrons () {
    debug("debut stupNavChevrons")
    const prev = scolarNavChevrons.prev;
    const next = scolarNavChevrons.next;
    
    if (!prev) return;
    if (!next) return;

    
    
    prev.addEventListener("click", () => {
        if (HISTORIC[0] === null && cursor === 0) return;
 
        const value = cursor - 1;
        setCursor(value);

        let previousFolder = HISTORIC[cursor];
                
        displayFolder(previousFolder);
    })

    next.addEventListener("click", () => {
        if (cursor < (HISTORIC.length - 1))  {
            const value = cursor + 1;
            setCursor(value)
            
            displayFolder(HISTORIC[cursor]);
        }
    })
}

export function setupFolderCreation () {
    if (!folderCreateButton) return;
    
    //on crée un dossier editable
    folderCreateButton.addEventListener("click", () =>{
        let button = renderEditableFolder()
        
        flashcardBox.append(button);
        
        setFocusOnInputs(button);
    })


    flashcardBox.addEventListener("click", (e) => {
        if (knowEditableFolderType() !== "create") return; //on verif que c'est bien en mode create
        
        
        const content = collectDataEditableFolder();
        if(content === null) return;

        const folder = createFolder(content);
        addFolder(folder);

        displayFolder(getActualFolderId());
    })
}

export function setupFolderSaving () {
    
    flashcardBox.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            switch(knowEditableFolderType()) {
                case "create" : {
                    const content = collectDataEditableFolder();
                    if(content === null) return;

                    const folder = createFolder(content);
                    addFolder(folder);

                    displayFolder(getActualFolderId());
                }

                case "edit" : {
                    debug("salut")
                }
            }
        }
    })
}



export function setupFolderEdit () {
    flashcardBox.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            const folder = e.target.closest(".folder");
            const folderId = folder.dataset.folderId;
            
            const champ = e.target.closest(".folder__champ");
            const text = champ.value;

            const content = editFolderName(text);
            updateFolder(folderId, content);

            displayFolder(getActualFolderId());
        }
    })

    flashcardBox.addEventListener("click", (e) =>{
        
        const folder = safeQuery(".folder[data-is-editable='true']");

        if (!folder || folder.contains(e.target)) return;
        
        const folderId = folder.dataset.folderId;

        const champ = folder.querySelector(".folder__champ");
        const text = champ.value;

        const content = editFolderName(text);
        updateFolder(folderId, content);

        displayFolder(getActualFolderId());
    })
}