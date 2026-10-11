import { safeId, safeQuery } from "../../utils/dom.js";
import { editableFlashcard, flashcardSwitchButton } from "./scolarUI.js";

//AI made : un éditeur Quill par face de la carte
export const editors = { front: null, back: null };

//AI made : une barre d'outils et une face par côté, pour pouvoir masquer celle qui n'est pas visible
const toolbars = { front: null, back: null };
const faces = { front: null, back: null };

export function setupEditor() {
    const frontContainer = safeId("editorFront");
    const backContainer = safeId("editorBack");
    const toolbarFront = safeId("flashcardToolbarFront");
    if (!frontContainer || !backContainer || !toolbarFront) return;   // on n'est pas sur la bonne page

    // Tailles en px, alignement en style inline
    const Size = Quill.import("attributors/style/size"); //import depuis lib interne, fait que le taille est écrit en direct (en px) plutot que système abstrait (small, medium, large)
    Size.whitelist = ["12px", "14px", "18px", "24px", "32px", "48px"]; //def la taille
    Quill.register(Size, true); //enregistre le nouveau système de taille avec "Size", tandis que le "true" écrase l'ancien
    Quill.register(Quill.import("attributors/style/align"), true); // Remplace l'alignement par classe CSS (ql-align-center) par un alignement en style inline (text-align: center)

    //AI made : chaque éditeur a besoin de sa propre barre (une barre partagée appliquerait les clics aux deux).
    // On duplique celle du HTML avant que Quill ne la transforme.
    const toolbarBack = toolbarFront.cloneNode(true); //.cloneNode est un function qui clone l'element auquel elle est atribuée, le true signifie que c'est l'element + ses descendants qui sont clonés
    toolbarBack.id = "flashcardToolbarBack";
    toolbarFront.after(toolbarBack); // méthode DOM qui insère le paramètre juste apres l'element (toolbarBack sera inséré juste après toolbarFront)

    toolbars.front = toolbarFront; 
    toolbars.back = toolbarBack;
    faces.front = safeQuery(".editableFlashcard__face--front");
    faces.back = safeQuery(".editableFlashcard__face--back");

    //AI made
    editors.front = new Quill(frontContainer, {
        theme: "snow",
        placeholder: "Recto : écris ta question...",
        modules: { toolbar: "#flashcardToolbarFront" }
    });

    editors.back = new Quill(backContainer, {
        theme: "snow",
        placeholder: "Verso : écris ta réponse...",
        modules: { toolbar: "#flashcardToolbarBack" }
    });

    showEditorFace("front", false);
}

//AI made : affiche la barre de la face visible et rend l'autre face inactive (ni clic, ni Tab)
export function showEditorFace(face, focus = true) { //la valeure par déffaut de focus est true
    if (!editors.front || !editors.back) return;
    const hidden = face === "front" ? "back" : "front";

    toolbars[face].classList.remove("flashcardToolbar--hidden");
    toolbars[hidden].classList.add("flashcardToolbar--hidden");

    if (faces[face]) faces[face].inert = false; //faces[face] revient à (si face = front ou back) a écrire faces.front ou faces.back
    //element.inert est une fonction DOM qui active ou desactive un element, si inert = true, alors l'element est visible mais il n'est plus clickable, mais il reste dans le dom
    if (faces[hidden]) faces[hidden].inert = true;

    if (focus) editors[face].focus(); //si focus est true, alors on place le curseur (avec la function DOM .focus() dans la face de l'editor)
}


//AI made : vide les deux faces et remet la carte sur le recto
export function resetFlashcardEditor() {
    if (!editors.front || !editors.back) return;   // pas sur la page scolar

    editors.front.setContents([]);
    editors.back.setContents([]);

    if (editableFlashcard) editableFlashcard.classList.remove("editableFlashcard--flipped");
    if (flashcardSwitchButton) flashcardSwitchButton.setAttribute("aria-pressed", "false");
    showEditorFace("front", false);
}

export function checkIfNotEmpty () {
    const content = {
        front : editors.front.getText(),
        back : editors.back.getText()
    }

    if (content.front.trim() === "" || content.back.trim() === "") {
        return false
    } else {
        return true
    }; 
}
