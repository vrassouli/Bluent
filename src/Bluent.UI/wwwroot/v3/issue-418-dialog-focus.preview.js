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
    // A newer modal enters the DOM before its asynchronous JS interop registration
    // completes. It must still block keyboard ownership from falling back to
    // a registered parent during that short hand-off window.
    return roots.reverse().find(root => root.isConnected && root.getClientRects().length > 0);
}

// A modal is not complete until everything outside its active owner is inert.
// Portalled Popovers explicitly cascading from the top Dialog are the only
// detached surfaces kept interactive alongside that Dialog's own wrapper.
const inertBackground = new Map();
let backgroundObserver = null;
let syncingBackground = false;

function restoreBackground() {
    for (const [element, state] of inertBackground) {
        if (!(element instanceof HTMLElement)) continue;
        element.inert = state.inert;
        if (state.ariaHidden === null)
            element.removeAttribute("aria-hidden");
        else
            element.setAttribute("aria-hidden", state.ariaHidden);
    }
    inertBackground.clear();
}

function syncModalBackground() {
    if (syncingBackground) return;
    syncingBackground = true;
    try {
        restoreBackground();
        const active = topModal();
        if (!active || !document.body) {
            backgroundObserver?.disconnect();
            backgroundObserver = null;
            return;
        }

        const wrapper = active.closest(".dialog-wrapper");
        if (!(wrapper instanceof HTMLElement)) return;
        const allowedRoots = new Set([wrapper, ...[...document.querySelectorAll("[data-bui-v3-modal-trigger]")]
            .filter(element => {
                if (!(element instanceof HTMLElement)) return false;
                const trigger = document.getElementById(element.dataset.buiV3ModalTrigger || "");
                return trigger?.closest(".bui-dialog")?.id === active.id;
            })]);
        const allowedChildren = new Map();
        for (const root of allowedRoots) {
            if (!root.isConnected) continue;
            let child = root;
            let parent = child.parentElement;
            while (parent) {
                let set = allowedChildren.get(parent);
                if (!set) allowedChildren.set(parent, set = new Set());
                set.add(child);
                if (parent === document.body) break;
                child = parent;
                parent = parent.parentElement;
            }
        }

        const markInert = element => {
            if (!(element instanceof HTMLElement) || inertBackground.has(element)) return;
            inertBackground.set(element, {
                inert: element.inert,
                ariaHidden: element.hasAttribute("aria-hidden") ? element.getAttribute("aria-hidden") : null
            });
            element.inert = true;
            element.setAttribute("aria-hidden", "true");
        };
        const apply = parent => {
            const allowed = allowedChildren.get(parent) || new Set();
            for (const child of parent.children) {
                if (allowedRoots.has(child)) continue; // The entire modal/owned portal subtree stays interactive.
                if (allowed.has(child)) apply(child);
                else markInert(child);
            }
        };
        apply(document.body);

        if (!backgroundObserver) {
            backgroundObserver = new MutationObserver(() => syncModalBackground());
            backgroundObserver.observe(document.body, { childList: true, subtree: true });
        }
    } finally {
        syncingBackground = false;
    }
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
    // A rendered topmost modal may still be awaiting its JS registration.
    // Treat it as a keyboard barrier rather than forwarding keys to its parent.
    // A closing modal is the same barrier until it is actually removed.
    if (!modalOwners.has(active) || active.classList.contains("hide")) {
        if (event.key === "Escape" || event.key === "Tab") {
            event.preventDefault();
            event.stopPropagation();
        }
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

export function hasZeroDialogAnimation(root) {
    if (!(root instanceof HTMLElement) || !root.isConnected) return false;
    const durations = getComputedStyle(root).animationDuration.split(',');
    return durations.length > 0 && durations.every(value => {
        const duration = parseFloat(value.trim());
        return Number.isFinite(duration) && duration === 0;
    });
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
    syncModalBackground();
    // The server-rendered nested wrapper can briefly be inert while the parent
    // still owns the stack. Once this root is registered and background state
    // has been recomputed, establish focus again on the newly active Dialog.
    root.focus({ preventScroll: true });
    if (!keyboardListenerInstalled) {
        window.addEventListener("keydown", onModalKeyDown);
        keyboardListenerInstalled = true;
    }
}

export function unregisterModal(rootOrId) {
    // During Blazor component disposal the actual DOM element may already
    // be detached. Resolve its retained JS owner by stable ID rather than
    // passing a stale ElementReference through interop.
    const root = typeof rootOrId === "string"
        ? [...modalOwners.keys()].find(el => el.id === rootOrId)
        : rootOrId;
    if (!root || !modalOwners.delete(root)) return;
    root.removeAttribute("data-bui-v3-keyboard-bound");
    syncModalBackground();
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
