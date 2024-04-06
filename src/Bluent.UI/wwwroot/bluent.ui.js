var t={d:(e,n)=>{for(var o in n)t.o(n,o)&&!t.o(e,o)&&Object.defineProperty(e,o,{enumerable:!0,get:n[o]})},o:(t,e)=>Object.prototype.hasOwnProperty.call(t,e)},e={};t.d(e,{A:()=>ot,S:()=>it});const n=Math.min,o=Math.max,i=Math.round,r=(Math.floor,t=>({x:t,y:t})),c={left:"right",right:"left",bottom:"top",top:"bottom"},l={start:"end",end:"start"};function a(t,e,i){return o(t,n(e,i))}function s(t,e){return"function"==typeof t?t(e):t}function f(t){return t.split("-")[0]}function u(t){return t.split("-")[1]}function d(t){return"x"===t?"y":"x"}function m(t){return"y"===t?"height":"width"}function p(t){return["top","bottom"].includes(f(t))?"y":"x"}function h(t){return d(p(t))}function g(t){return t.replace(/start|end/g,(t=>l[t]))}function y(t){return t.replace(/left|right|bottom|top/g,(t=>c[t]))}function w(t){return"number"!=typeof t?function(t){return{top:0,right:0,bottom:0,left:0,...t}}(t):{top:t,right:t,bottom:t,left:t}}function x(t){return{...t,top:t.y,left:t.x,right:t.x+t.width,bottom:t.y+t.height}}function v(t,e,n){let{reference:o,floating:i}=t;const r=p(e),c=h(e),l=m(c),a=f(e),s="y"===r,d=o.x+o.width/2-i.width/2,g=o.y+o.height/2-i.height/2,y=o[l]/2-i[l]/2;let w;switch(a){case"top":w={x:d,y:o.y-i.height};break;case"bottom":w={x:d,y:o.y+o.height};break;case"right":w={x:o.x+o.width,y:g};break;case"left":w={x:o.x-i.width,y:g};break;default:w={x:o.x,y:o.y}}switch(u(e)){case"start":w[c]-=y*(n&&s?-1:1);break;case"end":w[c]+=y*(n&&s?-1:1)}return w}async function b(t,e){var n;void 0===e&&(e={});const{x:o,y:i,platform:r,rects:c,elements:l,strategy:a}=t,{boundary:f="clippingAncestors",rootBoundary:u="viewport",elementContext:d="floating",altBoundary:m=!1,padding:p=0}=s(e,t),h=w(p),g=l[m?"floating"===d?"reference":"floating":d],y=x(await r.getClippingRect({element:null==(n=await(null==r.isElement?void 0:r.isElement(g)))||n?g:g.contextElement||await(null==r.getDocumentElement?void 0:r.getDocumentElement(l.floating)),boundary:f,rootBoundary:u,strategy:a})),v="floating"===d?{...c.floating,x:o,y:i}:c.reference,b=await(null==r.getOffsetParent?void 0:r.getOffsetParent(l.floating)),S=await(null==r.isElement?void 0:r.isElement(b))&&await(null==r.getScale?void 0:r.getScale(b))||{x:1,y:1},E=x(r.convertOffsetParentRelativeRectToViewportRelativeRect?await r.convertOffsetParentRelativeRectToViewportRelativeRect({elements:l,rect:v,offsetParent:b,strategy:a}):v);return{top:(y.top-E.top+h.top)/S.y,bottom:(E.bottom-y.bottom+h.bottom)/S.y,left:(y.left-E.left+h.left)/S.x,right:(E.right-y.right+h.right)/S.x}}const S=function(t){return void 0===t&&(t=0),{name:"offset",options:t,async fn(e){var n,o;const{x:i,y:r,placement:c,middlewareData:l}=e,a=await async function(t,e){const{placement:n,platform:o,elements:i}=t,r=await(null==o.isRTL?void 0:o.isRTL(i.floating)),c=f(n),l=u(n),a="y"===p(n),d=["left","top"].includes(c)?-1:1,m=r&&a?-1:1,h=s(e,t);let{mainAxis:g,crossAxis:y,alignmentAxis:w}="number"==typeof h?{mainAxis:h,crossAxis:0,alignmentAxis:null}:{mainAxis:0,crossAxis:0,alignmentAxis:null,...h};return l&&"number"==typeof w&&(y="end"===l?-1*w:w),a?{x:y*m,y:g*d}:{x:g*d,y:y*m}}(e,t);return c===(null==(n=l.offset)?void 0:n.placement)&&null!=(o=l.arrow)&&o.alignmentOffset?{}:{x:i+a.x,y:r+a.y,data:{...a,placement:c}}}}};function E(t){return L(t)?(t.nodeName||"").toLowerCase():"#document"}function R(t){var e;return(null==t||null==(e=t.ownerDocument)?void 0:e.defaultView)||window}function T(t){var e;return null==(e=(L(t)?t.ownerDocument:t.document)||window.document)?void 0:e.documentElement}function L(t){return t instanceof Node||t instanceof R(t).Node}function A(t){return t instanceof Element||t instanceof R(t).Element}function D(t){return t instanceof HTMLElement||t instanceof R(t).HTMLElement}function k(t){return"undefined"!=typeof ShadowRoot&&(t instanceof ShadowRoot||t instanceof R(t).ShadowRoot)}function O(t){const{overflow:e,overflowX:n,overflowY:o,display:i}=N(t);return/auto|scroll|overlay|hidden|clip/.test(e+o+n)&&!["inline","contents"].includes(i)}function P(t){return["table","td","th"].includes(E(t))}function C(t){const e=H(),n=N(t);return"none"!==n.transform||"none"!==n.perspective||!!n.containerType&&"normal"!==n.containerType||!e&&!!n.backdropFilter&&"none"!==n.backdropFilter||!e&&!!n.filter&&"none"!==n.filter||["transform","perspective","filter"].some((t=>(n.willChange||"").includes(t)))||["paint","layout","strict","content"].some((t=>(n.contain||"").includes(t)))}function H(){return!("undefined"==typeof CSS||!CSS.supports)&&CSS.supports("-webkit-backdrop-filter","none")}function M(t){return["html","body","#document"].includes(E(t))}function N(t){return R(t).getComputedStyle(t)}function F(t){return A(t)?{scrollLeft:t.scrollLeft,scrollTop:t.scrollTop}:{scrollLeft:t.pageXOffset,scrollTop:t.pageYOffset}}function W(t){if("html"===E(t))return t;const e=t.assignedSlot||t.parentNode||k(t)&&t.host||T(t);return k(e)?e.host:e}function V(t){const e=W(t);return M(e)?t.ownerDocument?t.ownerDocument.body:t.body:D(e)&&O(e)?e:V(e)}function B(t,e,n){var o;void 0===e&&(e=[]),void 0===n&&(n=!0);const i=V(t),r=i===(null==(o=t.ownerDocument)?void 0:o.body),c=R(i);return r?e.concat(c,c.visualViewport||[],O(i)?i:[],c.frameElement&&n?B(c.frameElement):[]):e.concat(i,B(i,[],n))}function _(t){const e=N(t);let n=parseFloat(e.width)||0,o=parseFloat(e.height)||0;const r=D(t),c=r?t.offsetWidth:n,l=r?t.offsetHeight:o,a=i(n)!==c||i(o)!==l;return a&&(n=c,o=l),{width:n,height:o,$:a}}function j(t){return A(t)?t:t.contextElement}function q(t){const e=j(t);if(!D(e))return r(1);const n=e.getBoundingClientRect(),{width:o,height:c,$:l}=_(e);let a=(l?i(n.width):n.width)/o,s=(l?i(n.height):n.height)/c;return a&&Number.isFinite(a)||(a=1),s&&Number.isFinite(s)||(s=1),{x:a,y:s}}const I=r(0);function X(t){const e=R(t);return H()&&e.visualViewport?{x:e.visualViewport.offsetLeft,y:e.visualViewport.offsetTop}:I}function Y(t,e,n,o){void 0===e&&(e=!1),void 0===n&&(n=!1);const i=t.getBoundingClientRect(),c=j(t);let l=r(1);e&&(o?A(o)&&(l=q(o)):l=q(t));const a=function(t,e,n){return void 0===e&&(e=!1),!(!n||e&&n!==R(t))&&e}(c,n,o)?X(c):r(0);let s=(i.left+a.x)/l.x,f=(i.top+a.y)/l.y,u=i.width/l.x,d=i.height/l.y;if(c){const t=R(c),e=o&&A(o)?R(o):o;let n=t,i=n.frameElement;for(;i&&o&&e!==n;){const t=q(i),e=i.getBoundingClientRect(),o=N(i),r=e.left+(i.clientLeft+parseFloat(o.paddingLeft))*t.x,c=e.top+(i.clientTop+parseFloat(o.paddingTop))*t.y;s*=t.x,f*=t.y,u*=t.x,d*=t.y,s+=r,f+=c,n=R(i),i=n.frameElement}}return x({width:u,height:d,x:s,y:f})}const $=[":popover-open",":modal"];function z(t){return $.some((e=>{try{return t.matches(e)}catch(t){return!1}}))}function G(t){return Y(T(t)).left+F(t).scrollLeft}function J(t,e,n){let i;if("viewport"===e)i=function(t,e){const n=R(t),o=T(t),i=n.visualViewport;let r=o.clientWidth,c=o.clientHeight,l=0,a=0;if(i){r=i.width,c=i.height;const t=H();(!t||t&&"fixed"===e)&&(l=i.offsetLeft,a=i.offsetTop)}return{width:r,height:c,x:l,y:a}}(t,n);else if("document"===e)i=function(t){const e=T(t),n=F(t),i=t.ownerDocument.body,r=o(e.scrollWidth,e.clientWidth,i.scrollWidth,i.clientWidth),c=o(e.scrollHeight,e.clientHeight,i.scrollHeight,i.clientHeight);let l=-n.scrollLeft+G(t);const a=-n.scrollTop;return"rtl"===N(i).direction&&(l+=o(e.clientWidth,i.clientWidth)-r),{width:r,height:c,x:l,y:a}}(T(t));else if(A(e))i=function(t,e){const n=Y(t,!0,"fixed"===e),o=n.top+t.clientTop,i=n.left+t.clientLeft,c=D(t)?q(t):r(1);return{width:t.clientWidth*c.x,height:t.clientHeight*c.y,x:i*c.x,y:o*c.y}}(e,n);else{const n=X(t);i={...e,x:e.x-n.x,y:e.y-n.y}}return x(i)}function K(t,e){const n=W(t);return!(n===e||!A(n)||M(n))&&("fixed"===N(n).position||K(n,e))}function Q(t,e,n){const o=D(e),i=T(e),c="fixed"===n,l=Y(t,!0,c,e);let a={scrollLeft:0,scrollTop:0};const s=r(0);if(o||!o&&!c)if(("body"!==E(e)||O(i))&&(a=F(e)),o){const t=Y(e,!0,c,e);s.x=t.x+e.clientLeft,s.y=t.y+e.clientTop}else i&&(s.x=G(i));return{x:l.left+a.scrollLeft-s.x,y:l.top+a.scrollTop-s.y,width:l.width,height:l.height}}function U(t,e){return D(t)&&"fixed"!==N(t).position?e?e(t):t.offsetParent:null}function Z(t,e){const n=R(t);if(!D(t)||z(t))return n;let o=U(t,e);for(;o&&P(o)&&"static"===N(o).position;)o=U(o,e);return o&&("html"===E(o)||"body"===E(o)&&"static"===N(o).position&&!C(o))?n:o||function(t){let e=W(t);for(;D(e)&&!M(e);){if(C(e))return e;e=W(e)}return null}(t)||n}const tt={convertOffsetParentRelativeRectToViewportRelativeRect:function(t){let{elements:e,rect:n,offsetParent:o,strategy:i}=t;const c="fixed"===i,l=T(o),a=!!e&&z(e.floating);if(o===l||a&&c)return n;let s={scrollLeft:0,scrollTop:0},f=r(1);const u=r(0),d=D(o);if((d||!d&&!c)&&(("body"!==E(o)||O(l))&&(s=F(o)),D(o))){const t=Y(o);f=q(o),u.x=t.x+o.clientLeft,u.y=t.y+o.clientTop}return{width:n.width*f.x,height:n.height*f.y,x:n.x*f.x-s.scrollLeft*f.x+u.x,y:n.y*f.y-s.scrollTop*f.y+u.y}},getDocumentElement:T,getClippingRect:function(t){let{element:e,boundary:i,rootBoundary:r,strategy:c}=t;const l=[..."clippingAncestors"===i?function(t,e){const n=e.get(t);if(n)return n;let o=B(t,[],!1).filter((t=>A(t)&&"body"!==E(t))),i=null;const r="fixed"===N(t).position;let c=r?W(t):t;for(;A(c)&&!M(c);){const e=N(c),n=C(c);n||"fixed"!==e.position||(i=null),(r?!n&&!i:!n&&"static"===e.position&&i&&["absolute","fixed"].includes(i.position)||O(c)&&!n&&K(t,c))?o=o.filter((t=>t!==c)):i=e,c=W(c)}return e.set(t,o),o}(e,this._c):[].concat(i),r],a=l[0],s=l.reduce(((t,i)=>{const r=J(e,i,c);return t.top=o(r.top,t.top),t.right=n(r.right,t.right),t.bottom=n(r.bottom,t.bottom),t.left=o(r.left,t.left),t}),J(e,a,c));return{width:s.right-s.left,height:s.bottom-s.top,x:s.left,y:s.top}},getOffsetParent:Z,getElementRects:async function(t){const e=this.getOffsetParent||Z,n=this.getDimensions;return{reference:Q(t.reference,await e(t.floating),t.strategy),floating:{x:0,y:0,...await n(t.floating)}}},getClientRects:function(t){return Array.from(t.getClientRects())},getDimensions:function(t){const{width:e,height:n}=_(t);return{width:e,height:n}},getScale:q,isElement:A,isRTL:function(t){return"rtl"===N(t).direction}},et=function(t){return void 0===t&&(t={}),{name:"shift",options:t,async fn(e){const{x:n,y:o,placement:i}=e,{mainAxis:r=!0,crossAxis:c=!1,limiter:l={fn:t=>{let{x:e,y:n}=t;return{x:e,y:n}}},...u}=s(t,e),m={x:n,y:o},h=await b(e,u),g=p(f(i)),y=d(g);let w=m[y],x=m[g];if(r){const t="y"===y?"bottom":"right";w=a(w+h["y"===y?"top":"left"],w,w-h[t])}if(c){const t="y"===g?"bottom":"right";x=a(x+h["y"===g?"top":"left"],x,x-h[t])}const v=l.fn({...e,[y]:w,[g]:x});return{...v,data:{x:v.x-n,y:v.y-o}}}}},nt=t=>({name:"arrow",options:t,async fn(e){const{x:o,y:i,placement:r,rects:c,platform:l,elements:f,middlewareData:d}=e,{element:p,padding:g=0}=s(t,e)||{};if(null==p)return{};const y=w(g),x={x:o,y:i},v=h(r),b=m(v),S=await l.getDimensions(p),E="y"===v,R=E?"top":"left",T=E?"bottom":"right",L=E?"clientHeight":"clientWidth",A=c.reference[b]+c.reference[v]-x[v]-c.floating[b],D=x[v]-c.reference[v],k=await(null==l.getOffsetParent?void 0:l.getOffsetParent(p));let O=k?k[L]:0;O&&await(null==l.isElement?void 0:l.isElement(k))||(O=f.floating[L]||c.floating[b]);const P=A/2-D/2,C=O/2-S[b]/2-1,H=n(y[R],C),M=n(y[T],C),N=H,F=O-S[b]-M,W=O/2-S[b]/2+P,V=a(N,W,F),B=!d.arrow&&null!=u(r)&&W!==V&&c.reference[b]/2-(W<N?H:M)-S[b]/2<0,_=B?W<N?W-N:W-F:0;return{[v]:x[v]+_,data:{[v]:V,centerOffset:W-V-_,...B&&{alignmentOffset:_}},reset:B}}});var ot=function(){function t(t){this._dotNetRef=t}return t.prototype.setPopover=function(t){var e=this,n=this.getTrigger(t);n&&(t.triggerEvents&&t.triggerEvents.forEach((function(o){n.addEventListener(o,(function(){e.renderSurface(t)}))})),t.hideEvents&&t.hideEvents.forEach((function(o){n.addEventListener(o,(function(){e.hideSurface(t)}))})))},t.prototype.showSurface=function(t){var e,n=this,o=this.getSurface(t),i=this.getTrigger(t),r=this.getArrow(t);((t,e,n)=>{const o=new Map,i={platform:tt,...n},r={...i.platform,_c:o};return(async(t,e,n)=>{const{placement:o="bottom",strategy:i="absolute",middleware:r=[],platform:c}=n,l=r.filter(Boolean),a=await(null==c.isRTL?void 0:c.isRTL(e));let s=await c.getElementRects({reference:t,floating:e,strategy:i}),{x:f,y:u}=v(s,o,a),d=o,m={},p=0;for(let n=0;n<l.length;n++){const{name:r,fn:h}=l[n],{x:g,y,data:w,reset:x}=await h({x:f,y:u,initialPlacement:o,placement:d,strategy:i,middlewareData:m,rects:s,platform:c,elements:{reference:t,floating:e}});f=null!=g?g:f,u=null!=y?y:u,m={...m,[r]:{...m[r],...w}},x&&p<=50&&(p++,"object"==typeof x&&(x.placement&&(d=x.placement),x.rects&&(s=!0===x.rects?await c.getElementRects({reference:t,floating:e,strategy:i}):x.rects),({x:f,y:u}=v(s,d,a))),n=-1)}return{x:f,y:u,placement:d,strategy:i,middlewareData:m}})(t,e,{...i,platform:r})})(i,o,{placement:t.placement,middleware:[(void 0===e&&(e={}),{name:"flip",options:e,async fn(t){var n,o;const{placement:i,middlewareData:r,rects:c,initialPlacement:l,platform:a,elements:d}=t,{mainAxis:p=!0,crossAxis:w=!0,fallbackPlacements:x,fallbackStrategy:v="bestFit",fallbackAxisSideDirection:S="none",flipAlignment:E=!0,...R}=s(e,t);if(null!=(n=r.arrow)&&n.alignmentOffset)return{};const T=f(i),L=f(l)===l,A=await(null==a.isRTL?void 0:a.isRTL(d.floating)),D=x||(L||!E?[y(l)]:function(t){const e=y(t);return[g(t),e,g(e)]}(l));x||"none"===S||D.push(...function(t,e,n,o){const i=u(t);let r=function(t,e,n){const o=["left","right"],i=["right","left"],r=["top","bottom"],c=["bottom","top"];switch(t){case"top":case"bottom":return n?e?i:o:e?o:i;case"left":case"right":return e?r:c;default:return[]}}(f(t),"start"===n,o);return i&&(r=r.map((t=>t+"-"+i)),e&&(r=r.concat(r.map(g)))),r}(l,E,S,A));const k=[l,...D],O=await b(t,R),P=[];let C=(null==(o=r.flip)?void 0:o.overflows)||[];if(p&&P.push(O[T]),w){const t=function(t,e,n){void 0===n&&(n=!1);const o=u(t),i=h(t),r=m(i);let c="x"===i?o===(n?"end":"start")?"right":"left":"start"===o?"bottom":"top";return e.reference[r]>e.floating[r]&&(c=y(c)),[c,y(c)]}(i,c,A);P.push(O[t[0]],O[t[1]])}if(C=[...C,{placement:i,overflows:P}],!P.every((t=>t<=0))){var H,M;const t=((null==(H=r.flip)?void 0:H.index)||0)+1,e=k[t];if(e)return{data:{index:t,overflows:C},reset:{placement:e}};let n=null==(M=C.filter((t=>t.overflows[0]<=0)).sort(((t,e)=>t.overflows[1]-e.overflows[1]))[0])?void 0:M.placement;if(!n)switch(v){case"bestFit":{var N;const t=null==(N=C.map((t=>[t.placement,t.overflows.filter((t=>t>0)).reduce(((t,e)=>t+e),0)])).sort(((t,e)=>t[1]-e[1]))[0])?void 0:N[0];t&&(n=t);break}case"initialPlacement":n=l}if(i!==n)return{reset:{placement:n}}}return{}}}),et({padding:5}),S(t.offsetOptions),nt({element:r})]}).then((function(e){var i,c=e.x,l=e.y,a=e.placement,s=e.middlewareData;Object.assign(o.style,{left:"".concat(c,"px"),top:"".concat(l,"px")});var f=s.arrow,u=f.x,d=f.y,m={top:"bottom",right:"left",bottom:"top",left:"right"}[a.split("-")[0]];r&&Object.assign(r.style,((i={left:null!=u?"".concat(u,"px"):"",top:null!=d?"".concat(d,"px"):"",right:"",bottom:""})[m]="-4px",i)),o.classList.contains("show")||o.classList.add("show"),document.addEventListener("click",n.onDocumentClicked.bind(n,t),{once:!0})}))},t.prototype.renderSurface=function(t){this._dotNetRef.invokeMethodAsync("RenderSurface",t)},t.prototype.onDocumentClicked=function(t,e){var n=this.getTrigger(t),o=this.getSurface(t);n&&o&&(n.contains(e.target)||o.contains(e.target)?document.addEventListener("click",this.onDocumentClicked.bind(this,t),{once:!0}):this.hideSurface(t))},t.prototype.hideSurface=function(t){var e=this,n=this.getSurface(t);n?(n.addEventListener("transitionend",(function(n){e._dotNetRef.invokeMethodAsync("HideSurface",t)}),{once:!0}),n.classList.contains("show")?n.classList.remove("show"):this._dotNetRef.invokeMethodAsync("HideSurface",t)):this._dotNetRef.invokeMethodAsync("HideSurface",t)},t.prototype.getTrigger=function(t){return document.querySelector("#".concat(t.triggerId))},t.prototype.getSurface=function(t){return document.querySelector(this.getSurafeSelector(t))},t.prototype.getArrow=function(t){return document.querySelector("".concat(this.getSurafeSelector(t),">.arrow"))},t.prototype.getSurafeSelector=function(t){return"#".concat(t.triggerId,"_surface")},t.create=function(e){return new t(e)},t}(),it=function(){function t(){}return t.setThemeMode=function(t){document.documentElement.setAttribute("data-bui-theme",t)},t.getThemeMode=function(){var t=document.documentElement.getAttribute("data-bui-theme");return null!=t?t:"light"},t.setDir=function(t){document.documentElement.setAttribute("dir",t)},t.getDir=function(){var t=document.documentElement.getAttribute("dir");return null!=t?t:"ltr"},t}(),rt=e.A,ct=e.S;export{rt as Popover,ct as Theme};
//# sourceMappingURL=bluent.ui.js.map