export function readCheckboxState(inputId) {
    const input = document.getElementById(inputId);
    if (!(input instanceof HTMLInputElement) || input.type !== "checkbox") {
        throw new Error("Checkbox input was not found: " + inputId);
    }

    const label = input.labels?.[0] ?? null;
    const marker = label?.querySelector(".required") ?? null;

    return {
        checked: input.checked,
        indeterminate: input.indeterminate,
        disabled: input.disabled,
        required: input.required,
        ariaInvalid: input.getAttribute("aria-invalid"),
        ariaLabel: input.getAttribute("aria-label"),
        ariaLabelledBy: input.getAttribute("aria-labelledby"),
        associatedLabelText: label?.textContent ?? null,
        markerText: marker?.textContent ?? null,
        markerAriaHidden: marker?.getAttribute("aria-hidden") ?? null
    };
}
