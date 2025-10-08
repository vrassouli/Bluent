import { OtpField } from './OtpField/OtpField';

// --- Idempotency guard ---
let lastRunStamp = 0;
function runOncePerTick(fn: () => void) {
    const now = Date.now();
    if (now - lastRunStamp < 30) return; // collapse bursts
    lastRunStamp = now;
    fn();
}

function initOtpFields(root: ParentNode = document) {
    const nodeList = (root as Document | Element).querySelectorAll?.('.bui-otp-field>.otp');
    const hosts: HTMLElement[] = nodeList ? Array.from(nodeList).filter(el => el instanceof HTMLElement) as HTMLElement[] : [];
    hosts.forEach(host => {
        const hostId = host.id;
        if (hostId) {
            try {
                const otp = new OtpField();
                otp.init(hostId);
            } catch (e) {
                // eslint-disable-next-line no-console
                console.warn('OtpField init failed', e);
            }
        }
    });
}

function initComponents(root: ParentNode = document) {
    initOtpFields(root);
}

export function initializeBluentUI(root: ParentNode = document) {
    try {
        initComponents(root);
    } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Bluent UI initialization error', err);
    }
}

// --- Event wiring strategy ---
// 1. DOMContentLoaded (earlier than full load) for first paint
// 2. load as safety net
// 3. enhancedload (Blazor enhanced navigation) – fires on document (and via Blazor.addEventListener if available)
// 4. Expose manual trigger

function wireListeners() {
    // Already wired? (use a symbol flag)
    const FLAG = '__bluentListeners';
    if ((window as any)[FLAG]) return;
    (window as any)[FLAG] = true;

    // Initial DOM ready
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        runOncePerTick(() => initializeBluentUI(document));
    } else {
        document.addEventListener('DOMContentLoaded', () => runOncePerTick(() => initializeBluentUI(document)), { once: true });
    }

    // Load (late safety)
    window.addEventListener('load', () => runOncePerTick(() => initializeBluentUI(document)));

    // Enhanced navigation (Blazor .NET 8) – event is dispatched on document
    document.addEventListener('enhancedload', () => runOncePerTick(() => initializeBluentUI(document)));

    // If Blazor exposes addEventListener API (future / current), use it as well
    const blazorAny = (window as any).Blazor;
    if (blazorAny && typeof blazorAny.addEventListener === 'function') {
        try {
            blazorAny.addEventListener('enhancedload', () => runOncePerTick(() => initializeBluentUI(document)));
        } catch { /* silent */ }
    }

    // Manual global trigger (back-compat)
    (window as any).BluentInit = initializeBluentUI;
}

wireListeners();



// // Automatic Blu ent UI initialization logic.
// // This file sets up component initialization on initial load, full load, and Blazor enhanced navigation events.

// import { AudioCapture } from './AudioCapture/AudioCapture';
// import { DataGrid } from './DataGrid/DataGrid';
// import { Popover } from './Popover/Popover';
// import { ScrollSync } from './ScrollSync/ScrollSync';
// import { Theme } from './Theme/Theme';

// // --- Internal one-time flags ---
// let themeApplied = false;

// function applyThemeOnce() {
//   if (themeApplied) return;
//   try {
//     const theme = new Theme();
//     if (typeof (theme as any).apply === 'function') {
//       (theme as any).apply();
//     }
//   } catch (err) {
//     // eslint-disable-next-line no-console
//     console.error('Theme init failed', err);
//   }
//   themeApplied = true;
// }

// // Utility to mark elements as initialized across navigations
// function mark(el: Element, key: string) {
//   (el as any)[key] = true;
// }
// function isMarked(el: Element, key: string) {
//   return !!(el as any)[key];
// }

// const FLAG_GRID = '__bluentGrid';
// const FLAG_POPOVER = '__bluentPopover';
// const FLAG_SCROLLSYNC = '__bluentScrollSyncGroup';
// const FLAG_AUDIO = '__bluentAudioCapture';

// function initComponents(root: ParentNode = document) {
//   applyThemeOnce();

//   // DataGrid(s)
//   root.querySelectorAll('[data-grid]').forEach(el => {
//     if (isMarked(el, FLAG_GRID)) return;
//     try {
//       // @ts-ignore constructor signature may differ
//       new DataGrid(el);
//       mark(el, FLAG_GRID);
//     } catch (e) {
//       // eslint-disable-next-line no-console
//       console.warn('DataGrid init failed', e);
//     }
//   });

//   // Popover(s)
//   root.querySelectorAll('[data-popover]').forEach(el => {
//     if (isMarked(el, FLAG_POPOVER)) return;
//     try {
//       // @ts-ignore
//       new Popover(el);
//       mark(el, FLAG_POPOVER);
//     } catch (e) {
//       // eslint-disable-next-line no-console
//       console.warn('Popover init failed', e);
//     }
//   });

//   // ScrollSync groups - initialize once globally
//   const scrollSyncGroups = root.querySelectorAll('[data-scroll-sync-group]');
//   if (scrollSyncGroups.length) {
//     if (!(window as any)[FLAG_SCROLLSYNC]) {
//       try {
//         // @ts-ignore
//         new ScrollSync(scrollSyncGroups);
//         (window as any)[FLAG_SCROLLSYNC] = true;
//       } catch (e) {
//         // eslint-disable-next-line no-console
//         console.warn('ScrollSync init failed', e);
//       }
//     }
//   }

//   // AudioCapture
//   root.querySelectorAll('[data-audio-capture]').forEach(el => {
//     if (isMarked(el, FLAG_AUDIO)) return;
//     try {
//       // @ts-ignore
//       new AudioCapture(el);
//       mark(el, FLAG_AUDIO);
//     } catch (e) {
//       // eslint-disable-next-line no-console
//       console.warn('AudioCapture init failed', e);
//     }
//   });
// }

// export function initializeBluentUI(root: ParentNode = document) {
//   try {
//     initComponents(root);
//   } catch (err) {
//     // eslint-disable-next-line no-console
//     console.error('Bluent UI initialization error', err);
//   }
// }

// // Auto-run on initial DOM readiness
// if (document.readyState === 'complete' || document.readyState === 'interactive') {
//   initializeBluentUI();
// } else {
//   document.addEventListener('DOMContentLoaded', () => initializeBluentUI(), { once: true });
// }

// // Full load (redundant safety; guarded by flags)
// window.addEventListener('load', () => initializeBluentUI());

// // Blazor enhanced navigation event
// window.addEventListener('enhancedload', () => initializeBluentUI(document));

// // Expose manual trigger (debug / dynamic content)
// ;(window as any).BluentInit = initializeBluentUI;
