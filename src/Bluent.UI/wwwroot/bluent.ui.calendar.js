export function observeCalendarTabExit(root, dotnetReference) {
    let disposed = false;
    let queued = false;
    let tabExitRequested = false;
    let tabExitResetTimer = 0;

    const resetTabExitRequest = () => {
        tabExitRequested = false;
        if (tabExitResetTimer) {
            window.clearTimeout(tabExitResetTimer);
            tabExitResetTimer = 0;
        }
    };

    const onKeyDown = event => {
        if (event.key !== "Tab") return;

        tabExitRequested = true;
        if (tabExitResetTimer)
            window.clearTimeout(tabExitResetTimer);
        tabExitResetTimer = window.setTimeout(resetTabExitRequest, 250);
    };

    const onFocusOut = () => {
        if (!tabExitRequested || queued || disposed) return;
        queued = true;

        window.setTimeout(() => {
            queued = false;
            const shouldCheckTabExit = tabExitRequested;
            resetTabExitRequest();
            if (!shouldCheckTabExit || disposed || !root.isConnected) return;

            const active = document.activeElement;
            const surface = root.closest('[role="dialog"]');
            if (!active || root.contains(active) || surface?.contains(active)) return;

            void dotnetReference.invokeMethodAsync("HandleCalendarTabExit").catch(() => {});
        }, 0);
    };

    root.addEventListener("keydown", onKeyDown);
    root.addEventListener("focusout", onFocusOut);
    return {
        dispose() {
            if (disposed) return;
            disposed = true;
            resetTabExitRequest();
            root.removeEventListener("keydown", onKeyDown);
            root.removeEventListener("focusout", onFocusOut);
        }
    };
}

export function focusActiveCalendarItem(root) {
    const activeDay = root.querySelector('button[tabindex="0"]:not(:disabled)');
    const selectedItem = root.querySelector('button[aria-pressed="true"]:not(:disabled)');
    const firstAvailable = root.querySelector('button:not(:disabled)');
    (activeDay || selectedItem || firstAvailable)?.focus();
}
