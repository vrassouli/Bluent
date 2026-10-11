/* #418 experimental explicit Dialog return-focus helper.
   This is an opt-in v3 research asset only, not a legacy global behavior. */
export function restoreFocus(elementId) {
    if (typeof elementId !== "string" || !elementId) return false;
    const target = document.getElementById(elementId);
    if (!target || !target.isConnected || target.matches(":disabled,[aria-disabled='true']"))
        return false;
    // Do not move focus behind any other remaining visible Dialog.
    const visibleDialogs = [...document.querySelectorAll(".dialog-wrapper .bui-dialog")]
        .filter(el => el.isConnected && el.getClientRects().length > 0 && !el.classList.contains("hide"));
    // Never restore focus behind the topmost visible Dialog. A nested
    // dialog may restore focus to the Button inside its owning parent.
    if (visibleDialogs.length && !visibleDialogs.at(-1).contains(target)) return false;
    target.focus({preventScroll: true});
    return document.activeElement === target;
}

/* Draft #418 modal keyboard semantics: a single per-module document listener
   serves only explicitly registered Dialog roots, ordered by rendered stack. */
const modalOwners = new Map();
let keyboardListenerInstalled = false;
const candidateSelector = [
    "button:not([disabled])", "a[href]", "input:not([disabled]):not([type='hidden'])",
    "select:not([disabled])", "textarea:not([disabled])",
    "[tabindex]:not([tabindex='-1'])"
].join(",");

function topModal() {
    const roots = [...document.querySelectorAll(
        ".dialog-wrapper .bui-dialog[aria-modal='true'][data-bui-v3-keyboard-modal]"
    )];
    return roots.reverse().find(root => modalOwners.has(root) &&
        root.isConnected && root.getClientRects().length > 0);
}

function focusables(root) {
    return [...root.querySelectorAll(candidateSelector)].filter(el => {
        if (!(el instanceof HTMLElement) || !el.isConnected ||
            getComputedStyle(el).visibility !== "visible" ||
            el.getClientRects().length === 0 || el.closest("[inert],[aria-hidden='true']") ||
            el.matches(":disabled,[aria-disabled='true']")) return false;
        const tab = el.getAttribute("tabindex");
        return tab === null || Number(tab) >= 0;
    });
}

function onModalKeyDown(event) {
    if (event.defaultPrevented || event.isComposing) return;
    const active = topModal();
    if (!active) return;
    // While a child is closing, do not accidentally Escape the parent or
    // transfer keyboard ownership before the child is really removed.
    if (active.classList.contains("hide")) {
        if (event.key === "Escape" || event.key === "Tab") event.preventDefault();
        return;
    }
    if (event.key === "Escape") {
        if (event.repeat) { event.preventDefault(); return; }
        event.preventDefault();
        event.stopPropagation();
        const owner = modalOwners.get(active);
        if (owner) void owner.invokeMethodAsync("DismissOnEscape").catch(() => {});
        return;
    }
    if (event.key !== "Tab" || event.altKey || event.ctrlKey || event.metaKey) return;
    const targets = focusables(active);
    const current = document.activeElement;
    const first = targets[0] || active, last = targets.at(-1) || active;
    const beyond = !active.contains(current);
    if (beyond || current === active || !targets.length ||
        (!event.shiftKey && current === last) ||
        (event.shiftKey && current === first)) {
        event.preventDefault();
        (event.shiftKey ? last : first).focus({ preventScroll: true });
    }
}

export function focusInitial(root, elementId) {
    if (!(root instanceof HTMLElement) || !root.isConnected) return false;
    const target = document.getElementById(elementId);
    // Never focus outside this named Dialog, including sibling/underlying
    // modals, disabled, inert, hidden and nonfocusable candidates.
    if (target instanceof HTMLElement && target !== root &&
        root.contains(target) && focusables(root).includes(target)) {
        target.focus({ preventScroll: true });
        if (document.activeElement === target) return true;
    }
    root.focus({ preventScroll: true });
    return false;
}
export function registerModal(root, dotnetReference) {
    if (!(root instanceof HTMLElement) || !dotnetReference) return;
    modalOwners.set(root, dotnetReference);
    root.setAttribute("data-bui-v3-keyboard-bound", "");
    if (!keyboardListenerInstalled) {
        window.addEventListener("keydown", onModalKeyDown);
        keyboardListenerInstalled = true;
    }
}

export function unregisterModal(root) {
    if (!modalOwners.delete(root)) return;
    root.removeAttribute("data-bui-v3-keyboard-bound");
    if (!modalOwners.size && keyboardListenerInstalled) {
        window.removeEventListener("keydown", onModalKeyDown);
        keyboardListenerInstalled = false;
    }
    // On nested close, focus must not remain on a detached element or escape
    // behind the remaining modal. The owning launcher is restored separately.
    requestAnimationFrame(() => {
        const next = topModal();
        if (next && !next.contains(document.activeElement))
            next.focus({ preventScroll: true });
    });
}