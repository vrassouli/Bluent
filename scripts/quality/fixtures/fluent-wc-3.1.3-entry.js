import '@fluentui/web-components/web-components.js';
import { setTheme } from '@fluentui/web-components';
import { webLightTheme, webDarkTheme } from '@fluentui/tokens';
setTheme(webLightTheme);
globalThis.__fluentReference = Object.freeze({version:'3.1.3',theme:'webLightTheme'});
const verify = () => {
 const tags=['fluent-button','fluent-toggle-button','fluent-compound-button','fluent-menu-button','fluent-slider'];
 const allDefined=tags.every(x=>!!customElements.get(x));
 document.documentElement.dataset.officialDefined=String(allDefined);
 document.documentElement.dataset.officialTheme='webLightTheme';
 globalThis.__fluentReferenceReady=allDefined;
};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',verify,{once:true}); else verify();
