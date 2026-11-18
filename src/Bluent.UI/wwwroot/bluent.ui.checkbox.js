/**
 * Synchronizes the native mixed state for nullable Bluent checkboxes.
 * Native checkbox semantics remain owned by the browser; do not author aria-checked.
 * @param {HTMLInputElement} input
 * @param {boolean} indeterminate
 */
export function setIndeterminate(input, indeterminate) {
    if (!(input instanceof HTMLInputElement) || input.type !== "checkbox") {
        return;
    }

    input.indeterminate = Boolean(indeterminate);
}
