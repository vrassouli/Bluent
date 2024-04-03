var t={d:(e,n)=>{for(var o in n)t.o(n,o)&&!t.o(e,o)&&Object.defineProperty(e,o,{enumerable:!0,get:n[o]})},o:(t,e)=>Object.prototype.hasOwnProperty.call(t,e)},e={};t.d(e,{A:()=>ct,m:()=>rt});const n=Math.min,o=Math.max,i=Math.round,r=(Math.floor,t=>({x:t,y:t})),c={left:"right",right:"left",bottom:"top",top:"bottom"},l={start:"end",end:"start"};function s(t,e,i){return o(t,n(e,i))}function a(t,e){return"function"==typeof t?t(e):t}function f(t){return t.split("-")[0]}function u(t){return t.split("-")[1]}function d(t){return"x"===t?"y":"x"}function p(t){return"y"===t?"height":"width"}function h(t){return["top","bottom"].includes(f(t))?"y":"x"}function m(t){return d(h(t))}function g(t){return t.replace(/start|end/g,(t=>l[t]))}function y(t){return t.replace(/left|right|bottom|top/g,(t=>c[t]))}function w(t){return"number"!=typeof t?function(t){return{top:0,right:0,bottom:0,left:0,...t}}(t):{top:t,right:t,bottom:t,left:t}}function x(t){return{...t,top:t.y,left:t.x,right:t.x+t.width,bottom:t.y+t.height}}function v(t,e,n){let{reference:o,floating:i}=t;const r=h(e),c=m(e),l=p(c),s=f(e),a="y"===r,d=o.x+o.width/2-i.width/2,g=o.y+o.height/2-i.height/2,y=o[l]/2-i[l]/2;let w;switch(s){case"top":w={x:d,y:o.y-i.height};break;case"bottom":w={x:d,y:o.y+o.height};break;case"right":w={x:o.x+o.width,y:g};break;case"left":w={x:o.x-i.width,y:g};break;default:w={x:o.x,y:o.y}}switch(u(e)){case"start":w[c]-=y*(n&&a?-1:1);break;case"end":w[c]+=y*(n&&a?-1:1)}return w}async function b(t,e){var n;void 0===e&&(e={});const{x:o,y:i,platform:r,rects:c,elements:l,strategy:s}=t,{boundary:f="clippingAncestors",rootBoundary:u="viewport",elementContext:d="floating",altBoundary:p=!1,padding:h=0}=a(e,t),m=w(h),g=l[p?"floating"===d?"reference":"floating":d],y=x(await r.getClippingRect({element:null==(n=await(null==r.isElement?void 0:r.isElement(g)))||n?g:g.contextElement||await(null==r.getDocumentElement?void 0:r.getDocumentElement(l.floating)),boundary:f,rootBoundary:u,strategy:s})),v="floating"===d?{...c.floating,x:o,y:i}:c.reference,b=await(null==r.getOffsetParent?void 0:r.getOffsetParent(l.floating)),T=await(null==r.isElement?void 0:r.isElement(b))&&await(null==r.getScale?void 0:r.getScale(b))||{x:1,y:1},L=x(r.convertOffsetParentRelativeRectToViewportRelativeRect?await r.convertOffsetParentRelativeRectToViewportRelativeRect({elements:l,rect:v,offsetParent:b,strategy:s}):v);return{top:(y.top-L.top+m.top)/T.y,bottom:(L.bottom-y.bottom+m.bottom)/T.y,left:(y.left-L.left+m.left)/T.x,right:(L.right-y.right+m.right)/T.x}}const T=function(t){return void 0===t&&(t=0),{name:"offset",options:t,async fn(e){var n,o;const{x:i,y:r,placement:c,middlewareData:l}=e,s=await async function(t,e){const{placement:n,platform:o,elements:i}=t,r=await(null==o.isRTL?void 0:o.isRTL(i.floating)),c=f(n),l=u(n),s="y"===h(n),d=["left","top"].includes(c)?-1:1,p=r&&s?-1:1,m=a(e,t);let{mainAxis:g,crossAxis:y,alignmentAxis:w}="number"==typeof m?{mainAxis:m,crossAxis:0,alignmentAxis:null}:{mainAxis:0,crossAxis:0,alignmentAxis:null,...m};return l&&"number"==typeof w&&(y="end"===l?-1*w:w),s?{x:y*p,y:g*d}:{x:g*d,y:y*p}}(e,t);return c===(null==(n=l.offset)?void 0:n.placement)&&null!=(o=l.arrow)&&o.alignmentOffset?{}:{x:i+s.x,y:r+s.y,data:{...s,placement:c}}}}};function L(t){return R(t)?(t.nodeName||"").toLowerCase():"#document"}function S(t){var e;return(null==t||null==(e=t.ownerDocument)?void 0:e.defaultView)||window}function E(t){var e;return null==(e=(R(t)?t.ownerDocument:t.document)||window.document)?void 0:e.documentElement}function R(t){return t instanceof Node||t instanceof S(t).Node}function A(t){return t instanceof Element||t instanceof S(t).Element}function D(t){return t instanceof HTMLElement||t instanceof S(t).HTMLElement}function O(t){return"undefined"!=typeof ShadowRoot&&(t instanceof ShadowRoot||t instanceof S(t).ShadowRoot)}function k(t){const{overflow:e,overflowX:n,overflowY:o,display:i}=F(t);return/auto|scroll|overlay|hidden|clip/.test(e+o+n)&&!["inline","contents"].includes(i)}function P(t){return["table","td","th"].includes(L(t))}function C(t){const e=M(),n=F(t);return"none"!==n.transform||"none"!==n.perspective||!!n.containerType&&"normal"!==n.containerType||!e&&!!n.backdropFilter&&"none"!==n.backdropFilter||!e&&!!n.filter&&"none"!==n.filter||["transform","perspective","filter"].some((t=>(n.willChange||"").includes(t)))||["paint","layout","strict","content"].some((t=>(n.contain||"").includes(t)))}function M(){return!("undefined"==typeof CSS||!CSS.supports)&&CSS.supports("-webkit-backdrop-filter","none")}function N(t){return["html","body","#document"].includes(L(t))}function F(t){return S(t).getComputedStyle(t)}function H(t){return A(t)?{scrollLeft:t.scrollLeft,scrollTop:t.scrollTop}:{scrollLeft:t.pageXOffset,scrollTop:t.pageYOffset}}function W(t){if("html"===L(t))return t;const e=t.assignedSlot||t.parentNode||O(t)&&t.host||E(t);return O(e)?e.host:e}function V(t){const e=W(t);return N(e)?t.ownerDocument?t.ownerDocument.body:t.body:D(e)&&k(e)?e:V(e)}function B(t,e,n){var o;void 0===e&&(e=[]),void 0===n&&(n=!0);const i=V(t),r=i===(null==(o=t.ownerDocument)?void 0:o.body),c=S(i);return r?e.concat(c,c.visualViewport||[],k(i)?i:[],c.frameElement&&n?B(c.frameElement):[]):e.concat(i,B(i,[],n))}function _(t){const e=F(t);let n=parseFloat(e.width)||0,o=parseFloat(e.height)||0;const r=D(t),c=r?t.offsetWidth:n,l=r?t.offsetHeight:o,s=i(n)!==c||i(o)!==l;return s&&(n=c,o=l),{width:n,height:o,$:s}}function j(t){return A(t)?t:t.contextElement}function q(t){const e=j(t);if(!D(e))return r(1);const n=e.getBoundingClientRect(),{width:o,height:c,$:l}=_(e);let s=(l?i(n.width):n.width)/o,a=(l?i(n.height):n.height)/c;return s&&Number.isFinite(s)||(s=1),a&&Number.isFinite(a)||(a=1),{x:s,y:a}}const I=r(0);function X(t){const e=S(t);return M()&&e.visualViewport?{x:e.visualViewport.offsetLeft,y:e.visualViewport.offsetTop}:I}function Y(t,e,n,o){void 0===e&&(e=!1),void 0===n&&(n=!1);const i=t.getBoundingClientRect(),c=j(t);let l=r(1);e&&(o?A(o)&&(l=q(o)):l=q(t));const s=function(t,e,n){return void 0===e&&(e=!1),!(!n||e&&n!==S(t))&&e}(c,n,o)?X(c):r(0);let a=(i.left+s.x)/l.x,f=(i.top+s.y)/l.y,u=i.width/l.x,d=i.height/l.y;if(c){const t=S(c),e=o&&A(o)?S(o):o;let n=t,i=n.frameElement;for(;i&&o&&e!==n;){const t=q(i),e=i.getBoundingClientRect(),o=F(i),r=e.left+(i.clientLeft+parseFloat(o.paddingLeft))*t.x,c=e.top+(i.clientTop+parseFloat(o.paddingTop))*t.y;a*=t.x,f*=t.y,u*=t.x,d*=t.y,a+=r,f+=c,n=S(i),i=n.frameElement}}return x({width:u,height:d,x:a,y:f})}const $=[":popover-open",":modal"];function z(t){return $.some((e=>{try{return t.matches(e)}catch(t){return!1}}))}function G(t){return Y(E(t)).left+H(t).scrollLeft}function J(t,e,n){let i;if("viewport"===e)i=function(t,e){const n=S(t),o=E(t),i=n.visualViewport;let r=o.clientWidth,c=o.clientHeight,l=0,s=0;if(i){r=i.width,c=i.height;const t=M();(!t||t&&"fixed"===e)&&(l=i.offsetLeft,s=i.offsetTop)}return{width:r,height:c,x:l,y:s}}(t,n);else if("document"===e)i=function(t){const e=E(t),n=H(t),i=t.ownerDocument.body,r=o(e.scrollWidth,e.clientWidth,i.scrollWidth,i.clientWidth),c=o(e.scrollHeight,e.clientHeight,i.scrollHeight,i.clientHeight);let l=-n.scrollLeft+G(t);const s=-n.scrollTop;return"rtl"===F(i).direction&&(l+=o(e.clientWidth,i.clientWidth)-r),{width:r,height:c,x:l,y:s}}(E(t));else if(A(e))i=function(t,e){const n=Y(t,!0,"fixed"===e),o=n.top+t.clientTop,i=n.left+t.clientLeft,c=D(t)?q(t):r(1);return{width:t.clientWidth*c.x,height:t.clientHeight*c.y,x:i*c.x,y:o*c.y}}(e,n);else{const n=X(t);i={...e,x:e.x-n.x,y:e.y-n.y}}return x(i)}function K(t,e){const n=W(t);return!(n===e||!A(n)||N(n))&&("fixed"===F(n).position||K(n,e))}function Q(t,e,n){const o=D(e),i=E(e),c="fixed"===n,l=Y(t,!0,c,e);let s={scrollLeft:0,scrollTop:0};const a=r(0);if(o||!o&&!c)if(("body"!==L(e)||k(i))&&(s=H(e)),o){const t=Y(e,!0,c,e);a.x=t.x+e.clientLeft,a.y=t.y+e.clientTop}else i&&(a.x=G(i));return{x:l.left+s.scrollLeft-a.x,y:l.top+s.scrollTop-a.y,width:l.width,height:l.height}}function U(t,e){return D(t)&&"fixed"!==F(t).position?e?e(t):t.offsetParent:null}function Z(t,e){const n=S(t);if(!D(t)||z(t))return n;let o=U(t,e);for(;o&&P(o)&&"static"===F(o).position;)o=U(o,e);return o&&("html"===L(o)||"body"===L(o)&&"static"===F(o).position&&!C(o))?n:o||function(t){let e=W(t);for(;D(e)&&!N(e);){if(C(e))return e;e=W(e)}return null}(t)||n}const tt={convertOffsetParentRelativeRectToViewportRelativeRect:function(t){let{elements:e,rect:n,offsetParent:o,strategy:i}=t;const c="fixed"===i,l=E(o),s=!!e&&z(e.floating);if(o===l||s&&c)return n;let a={scrollLeft:0,scrollTop:0},f=r(1);const u=r(0),d=D(o);if((d||!d&&!c)&&(("body"!==L(o)||k(l))&&(a=H(o)),D(o))){const t=Y(o);f=q(o),u.x=t.x+o.clientLeft,u.y=t.y+o.clientTop}return{width:n.width*f.x,height:n.height*f.y,x:n.x*f.x-a.scrollLeft*f.x+u.x,y:n.y*f.y-a.scrollTop*f.y+u.y}},getDocumentElement:E,getClippingRect:function(t){let{element:e,boundary:i,rootBoundary:r,strategy:c}=t;const l=[..."clippingAncestors"===i?function(t,e){const n=e.get(t);if(n)return n;let o=B(t,[],!1).filter((t=>A(t)&&"body"!==L(t))),i=null;const r="fixed"===F(t).position;let c=r?W(t):t;for(;A(c)&&!N(c);){const e=F(c),n=C(c);n||"fixed"!==e.position||(i=null),(r?!n&&!i:!n&&"static"===e.position&&i&&["absolute","fixed"].includes(i.position)||k(c)&&!n&&K(t,c))?o=o.filter((t=>t!==c)):i=e,c=W(c)}return e.set(t,o),o}(e,this._c):[].concat(i),r],s=l[0],a=l.reduce(((t,i)=>{const r=J(e,i,c);return t.top=o(r.top,t.top),t.right=n(r.right,t.right),t.bottom=n(r.bottom,t.bottom),t.left=o(r.left,t.left),t}),J(e,s,c));return{width:a.right-a.left,height:a.bottom-a.top,x:a.left,y:a.top}},getOffsetParent:Z,getElementRects:async function(t){const e=this.getOffsetParent||Z,n=this.getDimensions;return{reference:Q(t.reference,await e(t.floating),t.strategy),floating:{x:0,y:0,...await n(t.floating)}}},getClientRects:function(t){return Array.from(t.getClientRects())},getDimensions:function(t){const{width:e,height:n}=_(t);return{width:e,height:n}},getScale:q,isElement:A,isRTL:function(t){return"rtl"===F(t).direction}},et=function(t){return void 0===t&&(t={}),{name:"shift",options:t,async fn(e){const{x:n,y:o,placement:i}=e,{mainAxis:r=!0,crossAxis:c=!1,limiter:l={fn:t=>{let{x:e,y:n}=t;return{x:e,y:n}}},...u}=a(t,e),p={x:n,y:o},m=await b(e,u),g=h(f(i)),y=d(g);let w=p[y],x=p[g];if(r){const t="y"===y?"bottom":"right";w=s(w+m["y"===y?"top":"left"],w,w-m[t])}if(c){const t="y"===g?"bottom":"right";x=s(x+m["y"===g?"top":"left"],x,x-m[t])}const v=l.fn({...e,[y]:w,[g]:x});return{...v,data:{x:v.x-n,y:v.y-o}}}}},nt=function(t){return void 0===t&&(t={}),{name:"flip",options:t,async fn(e){var n,o;const{placement:i,middlewareData:r,rects:c,initialPlacement:l,platform:s,elements:d}=e,{mainAxis:h=!0,crossAxis:w=!0,fallbackPlacements:x,fallbackStrategy:v="bestFit",fallbackAxisSideDirection:T="none",flipAlignment:L=!0,...S}=a(t,e);if(null!=(n=r.arrow)&&n.alignmentOffset)return{};const E=f(i),R=f(l)===l,A=await(null==s.isRTL?void 0:s.isRTL(d.floating)),D=x||(R||!L?[y(l)]:function(t){const e=y(t);return[g(t),e,g(e)]}(l));x||"none"===T||D.push(...function(t,e,n,o){const i=u(t);let r=function(t,e,n){const o=["left","right"],i=["right","left"],r=["top","bottom"],c=["bottom","top"];switch(t){case"top":case"bottom":return n?e?i:o:e?o:i;case"left":case"right":return e?r:c;default:return[]}}(f(t),"start"===n,o);return i&&(r=r.map((t=>t+"-"+i)),e&&(r=r.concat(r.map(g)))),r}(l,L,T,A));const O=[l,...D],k=await b(e,S),P=[];let C=(null==(o=r.flip)?void 0:o.overflows)||[];if(h&&P.push(k[E]),w){const t=function(t,e,n){void 0===n&&(n=!1);const o=u(t),i=m(t),r=p(i);let c="x"===i?o===(n?"end":"start")?"right":"left":"start"===o?"bottom":"top";return e.reference[r]>e.floating[r]&&(c=y(c)),[c,y(c)]}(i,c,A);P.push(k[t[0]],k[t[1]])}if(C=[...C,{placement:i,overflows:P}],!P.every((t=>t<=0))){var M,N;const t=((null==(M=r.flip)?void 0:M.index)||0)+1,e=O[t];if(e)return{data:{index:t,overflows:C},reset:{placement:e}};let n=null==(N=C.filter((t=>t.overflows[0]<=0)).sort(((t,e)=>t.overflows[1]-e.overflows[1]))[0])?void 0:N.placement;if(!n)switch(v){case"bestFit":{var F;const t=null==(F=C.map((t=>[t.placement,t.overflows.filter((t=>t>0)).reduce(((t,e)=>t+e),0)])).sort(((t,e)=>t[1]-e[1]))[0])?void 0:F[0];t&&(n=t);break}case"initialPlacement":n=l}if(i!==n)return{reset:{placement:n}}}return{}}}},ot=t=>({name:"arrow",options:t,async fn(e){const{x:o,y:i,placement:r,rects:c,platform:l,elements:f,middlewareData:d}=e,{element:h,padding:g=0}=a(t,e)||{};if(null==h)return{};const y=w(g),x={x:o,y:i},v=m(r),b=p(v),T=await l.getDimensions(h),L="y"===v,S=L?"top":"left",E=L?"bottom":"right",R=L?"clientHeight":"clientWidth",A=c.reference[b]+c.reference[v]-x[v]-c.floating[b],D=x[v]-c.reference[v],O=await(null==l.getOffsetParent?void 0:l.getOffsetParent(h));let k=O?O[R]:0;k&&await(null==l.isElement?void 0:l.isElement(O))||(k=f.floating[R]||c.floating[b]);const P=A/2-D/2,C=k/2-T[b]/2-1,M=n(y[S],C),N=n(y[E],C),F=M,H=k-T[b]-N,W=k/2-T[b]/2+P,V=s(F,W,H),B=!d.arrow&&null!=u(r)&&W!==V&&c.reference[b]/2-(W<F?M:N)-T[b]/2<0,_=B?W<F?W-F:W-H:0;return{[v]:x[v]+_,data:{[v]:V,centerOffset:W-V-_,...B&&{alignmentOffset:_}},reset:B}}}),it=(t,e,n)=>{const o=new Map,i={platform:tt,...n},r={...i.platform,_c:o};return(async(t,e,n)=>{const{placement:o="bottom",strategy:i="absolute",middleware:r=[],platform:c}=n,l=r.filter(Boolean),s=await(null==c.isRTL?void 0:c.isRTL(e));let a=await c.getElementRects({reference:t,floating:e,strategy:i}),{x:f,y:u}=v(a,o,s),d=o,p={},h=0;for(let n=0;n<l.length;n++){const{name:r,fn:m}=l[n],{x:g,y,data:w,reset:x}=await m({x:f,y:u,initialPlacement:o,placement:d,strategy:i,middlewareData:p,rects:a,platform:c,elements:{reference:t,floating:e}});f=null!=g?g:f,u=null!=y?y:u,p={...p,[r]:{...p[r],...w}},x&&h<=50&&(h++,"object"==typeof x&&(x.placement&&(d=x.placement),x.rects&&(a=!0===x.rects?await c.getElementRects({reference:t,floating:e,strategy:i}):x.rects),({x:f,y:u}=v(a,d,s))),n=-1)}return{x:f,y:u,placement:d,strategy:i,middlewareData:p}})(t,e,{...i,platform:r})};var rt=function(){function t(){}return t.prototype.setTooltip=function(t,e,n,o){var i=this;void 0===n&&(n="top"),void 0===o&&(o=6);var r=document.querySelector(t),c=document.querySelector(e),l=document.querySelector("".concat(e,">.arrow"));this.updateTooltip(r,c,l,n,o),r.addEventListener("mouseenter",(function(){i.showTooltip(r,c,l,n,o)})),r.addEventListener("focus",(function(){i.showTooltip(r,c,l,n,o)})),r.addEventListener("mouseleave",(function(){i.hideTooltip(c)})),r.addEventListener("blur",(function(){i.hideTooltip(c)}))},t.prototype.updateTooltip=function(t,e,n,o,i){it(t,e,{placement:o,middleware:[nt(),et({padding:5}),T(i),ot({element:n})]}).then((function(t){var o,i=t.x,r=t.y,c=t.placement,l=t.middlewareData;Object.assign(e.style,{left:"".concat(i,"px"),top:"".concat(r,"px")});var s=l.arrow,a=s.x,f=s.y,u={top:"bottom",right:"left",bottom:"top",left:"right"}[c.split("-")[0]];n&&Object.assign(n.style,((o={left:null!=a?"".concat(a,"px"):"",top:null!=f?"".concat(f,"px"):"",right:"",bottom:""})[u]="-4px",o))}))},t.prototype.showTooltip=function(t,e,n,o,i){this.updateTooltip(t,e,n,o,i),e.classList.contains("show")||e.classList.add("show")},t.prototype.hideTooltip=function(t){t.classList.contains("show")&&t.classList.remove("show")},t.create=function(){return new t},t}(),ct=function(){function t(t){this._dotNetRef=t}return t.prototype.setPopover=function(t){var e=this,n=this.getTrigger(t);n&&(t.triggerEvents&&t.triggerEvents.forEach((function(o){n.addEventListener(o,(function(){e.renderSurface(t)}))})),t.hideEvents&&t.hideEvents.forEach((function(o){n.addEventListener(o,(function(){e.hideSurface(t)}))})))},t.prototype.showSurface=function(t){var e=this,n=this.getSurface(t),o=this.getTrigger(t),i=this.getArrow(t);it(o,n,{placement:t.placement,middleware:[nt(),et({padding:5}),T(t.offsetOptions),ot({element:i})]}).then((function(o){var r,c=o.x,l=o.y,s=o.placement,a=o.middlewareData;Object.assign(n.style,{left:"".concat(c,"px"),top:"".concat(l,"px")});var f=a.arrow,u=f.x,d=f.y,p={top:"bottom",right:"left",bottom:"top",left:"right"}[s.split("-")[0]];i&&Object.assign(i.style,((r={left:null!=u?"".concat(u,"px"):"",top:null!=d?"".concat(d,"px"):"",right:"",bottom:""})[p]="-4px",r)),n.classList.contains("show")||n.classList.add("show"),document.addEventListener("click",e.onDocumentClicked.bind(e,t),{once:!0})}))},t.prototype.renderSurface=function(t){this._dotNetRef.invokeMethodAsync("RenderSurface",t)},t.prototype.onDocumentClicked=function(t,e){var n=this.getTrigger(t),o=this.getSurface(t);n.contains(e.target)||o.contains(e.target)?document.addEventListener("click",this.onDocumentClicked.bind(this,t),{once:!0}):this.hideSurface(t)},t.prototype.hideSurface=function(t){var e=this,n=this.getSurface(t);n?(n.addEventListener("transitionend",(function(n){e._dotNetRef.invokeMethodAsync("DestroySurface",t)}),{once:!0}),n.classList.contains("show")?n.classList.remove("show"):this._dotNetRef.invokeMethodAsync("DestroySurface",t)):this._dotNetRef.invokeMethodAsync("DestroySurface",t)},t.prototype.getTrigger=function(t){return document.querySelector("#".concat(t.triggerId))},t.prototype.getSurface=function(t){return document.querySelector(this.getSurafeSelector(t))},t.prototype.getArrow=function(t){return document.querySelector("".concat(this.getSurafeSelector(t),">.arrow"))},t.prototype.getSurafeSelector=function(t){return"#".concat(t.triggerId,"_surface")},t.create=function(e){return new t(e)},t}(),lt=e.A,st=e.m;export{lt as Popover,st as Tooltip};
//# sourceMappingURL=bluent.ui.js.map