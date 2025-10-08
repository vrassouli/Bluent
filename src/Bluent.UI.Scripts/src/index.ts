import { AudioCapture } from './AudioCapture/AudioCapture';
import { DataGrid } from './DataGrid/DataGrid';
import { DomHelper } from './DomHelper/DomHelper';
import { OtpField } from './OtpField/OtpField';
import { Overflow } from './Overflow/Overflow';
import { Popover } from './Popover/Popover';
import { ScrollSync } from './ScrollSync/ScrollSync';
import { Theme } from './Theme/Theme';

// Import initialization (was side-effect); export explicitly
import { initializeBluentUI } from './autoInit';

export { AudioCapture, DataGrid, DomHelper, Overflow, OtpField, Popover, ScrollSync, Theme, initializeBluentUI };

// Provide a global namespace when loaded via <script type="module" src="..."> for SSR non-interactive scenarios
// (Does not pollute when tree-shaken, minimal overhead.)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(window as any).BluentUI = {
	AudioCapture,
	DataGrid,
	DomHelper,
	Overflow,
	OtpField,
	Popover,
	ScrollSync,
	Theme,
	initializeBluentUI,
	// Back-compat alias
	BluentInit: initializeBluentUI
};
