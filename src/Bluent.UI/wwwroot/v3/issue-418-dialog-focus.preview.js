/* #418 experimental explicit Dialog return-focus helper.
   This is an opt-in v3 research asset only, not a legacy global behavior. */
export function restoreFocus(elementId) {
    if (typeof elementId !== "string" || !elementId) return false;
    const target = document.getElementById(elementId);
    if (!target || !target.isConnected || target.matches(":disabled,[aria-disabled='true']"))
        return false;
    // Do not move focus behind any other remaining visible Dialog.
    if ([...document.querySelectorAll(".dialog-wrapper .bui-dialog")]
        .some(el => el.getClientRects().length > 0)) return false;
    target.focus({preventScroll: true});
    return document.activeElement === target;
}