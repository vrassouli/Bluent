import '@fluentui/web-components/web-components.js';
import { setTheme } from '@fluentui/web-components';
import { webLightTheme, webDarkTheme } from '@fluentui/tokens';
const scenario=new URLSearchParams(location.search).get('scenario')||'baseline';
if(scenario==='dark-rtl'||scenario==='dark-ltr') {
 setTheme(webDarkTheme);
 document.documentElement.dataset.referenceMode='dark';
} else {
 setTheme(webLightTheme);
 document.documentElement.dataset.referenceMode='light';
}
document.documentElement.dir=scenario.endsWith('rtl')?'rtl':'ltr';
if(scenario!=='baseline')document.documentElement.dataset.normalizedFixture='true';
globalThis.__fluentReference = Object.freeze({version:'3.1.3',theme:scenario.startsWith('dark')?'webDarkTheme':'webLightTheme',scenario});
const verify = () => {
 const tags=['fluent-button','fluent-toggle-button','fluent-compound-button','fluent-menu-button','fluent-slider'];
 const allDefined=tags.every(x=>!!customElements.get(x));
 document.documentElement.dataset.officialDefined=String(allDefined);
 document.documentElement.dataset.officialTheme=scenario.startsWith('dark')?'webDarkTheme':'webLightTheme';
 globalThis.__fluentReferenceReady=allDefined;
};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',verify,{once:true}); else verify();