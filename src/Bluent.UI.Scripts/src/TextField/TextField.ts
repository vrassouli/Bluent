export type TextFieldSelectionDirection = "forward" | "backward" | "none";

export interface TextFieldSelection {
    start: number;
    end: number;
    direction: TextFieldSelectionDirection;
}

type TextFieldInputElement = HTMLInputElement | HTMLTextAreaElement;

const selectionSnapshots = new WeakMap<TextFieldInputElement, TextFieldSelection>();
const selectionListeners = new WeakMap<TextFieldInputElement, EventListener>();

function readNativeSelection(element: TextFieldInputElement): TextFieldSelection | null {
    if (!element || typeof element.selectionStart !== "number" || typeof element.selectionEnd !== "number") {
        return null;
    }

    try {
        return {
            start: element.selectionStart,
            end: element.selectionEnd,
            direction: element.selectionDirection || "none"
        };
    } catch {
        return null;
    }
}

/**
 * Captures the browser's post-edit native selection synchronously during the
 * input capture phase, before Blazor's delegated input handler can rerender the
 * normalized value and move the caret.
 */
export function trackTextSelection(element: TextFieldInputElement): void {
    if (!element || selectionListeners.has(element)) {
        return;
    }

    const listener: EventListener = () => {
        const selection = readNativeSelection(element);
        if (selection) {
            selectionSnapshots.set(element, selection);
        }
    };

    element.addEventListener("input", listener, true);
    selectionListeners.set(element, listener);
}

/**
 * Returns the selection snapshot captured before Blazor's input handler. The
 * current native selection is only a fallback for callers outside that event
 * sequence. A snapshot is consumed once so a later event cannot reuse stale data.
 */
export function getTextSelection(element: TextFieldInputElement): TextFieldSelection | null {
    if (!element) {
        return null;
    }

    const snapshot = selectionSnapshots.get(element);
    if (snapshot) {
        selectionSnapshots.delete(element);
        return snapshot;
    }

    return readNativeSelection(element);
}

/**
 * Restores a mapped native selection after Blazor has rendered the normalized
 * value. setSelectionRange does not move focus to the control.
 */
export function setTextSelection(
    element: TextFieldInputElement,
    start: number,
    end: number,
    direction: TextFieldSelectionDirection = "none"
): boolean {
    if (!element || typeof element.setSelectionRange !== "function") {
        return false;
    }

    try {
        element.setSelectionRange(start, end, direction);
        return true;
    } catch {
        return false;
    }
}

/** Removes the input listener and any pending selection snapshot. */
export function stopTrackingTextSelection(element: TextFieldInputElement): void {
    if (!element) {
        return;
    }

    const listener = selectionListeners.get(element);
    if (listener) {
        element.removeEventListener("input", listener, true);
        selectionListeners.delete(element);
    }

    selectionSnapshots.delete(element);
}