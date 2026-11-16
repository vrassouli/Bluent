export function attachNumericField(input, dotnetReference) {
    let disposed = false;
    const onKeyDown = (event) => {
        if (disposed || event.isComposing || input.disabled || input.readOnly ||
            event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
        let command = null;
        switch (event.key) {
            case "ArrowUp": command = "increment"; break;
            case "ArrowDown": command = "decrement"; break;
            case "Home": if (input.dataset.buiNumericHasMin?.toLowerCase() === "true") command = "minimum"; break;
            case "End": if (input.dataset.buiNumericHasMax?.toLowerCase() === "true") command = "maximum"; break;
        }
        if (!command) return;
        event.preventDefault();
        void dotnetReference.invokeMethodAsync("HandleNumericFieldKeyAsync", command).catch(() => {});
    };
    input.addEventListener("keydown", onKeyDown);
    return { dispose() { if (disposed) return; disposed = true; input.removeEventListener("keydown", onKeyDown); } };
}
