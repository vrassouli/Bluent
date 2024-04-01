var t={d:(e,n)=>{for(var o in n)t.o(n,o)&&!t.o(e,o)&&Object.defineProperty(e,o,{enumerable:!0,get:n[o]})},o:(t,e)=>Object.prototype.hasOwnProperty.call(t,e)},e={};t.d(e,{m:()=>ot});const n=Math.min,o=Math.max,i=Math.round,r=(Math.floor,t=>({x:t,y:t})),l={left:"right",right:"left",bottom:"top",top:"bottom"},c={start:"end",end:"start"};function a(t,e,i){return o(t,n(e,i))}function s(t,e){return"function"==typeof t?t(e):t}function f(t){return t.split("-")[0]}function u(t){return t.split("-")[1]}function d(t){return"x"===t?"y":"x"}function p(t){return"y"===t?"height":"width"}function m(t){return["top","bottom"].includes(f(t))?"y":"x"}function h(t){return d(m(t))}function g(t){return t.replace(/start|end/g,(t=>c[t]))}function y(t){return t.replace(/left|right|bottom|top/g,(t=>l[t]))}function x(t){return"number"!=typeof t?function(t){return{top:0,right:0,bottom:0,left:0,...t}}(t):{top:t,right:t,bottom:t,left:t}}function w(t){return{...t,top:t.y,left:t.x,right:t.x+t.width,bottom:t.y+t.height}}function v(t,e,n){let{reference:o,floating:i}=t;const r=m(e),l=h(e),c=p(l),a=f(e),s="y"===r,d=o.x+o.width/2-i.width/2,g=o.y+o.height/2-i.height/2,y=o[c]/2-i[c]/2;let x;switch(a){case"top":x={x:d,y:o.y-i.height};break;case"bottom":x={x:d,y:o.y+o.height};break;case"right":x={x:o.x+o.width,y:g};break;case"left":x={x:o.x-i.width,y:g};break;default:x={x:o.x,y:o.y}}switch(u(e)){case"start":x[l]-=y*(n&&s?-1:1);break;case"end":x[l]+=y*(n&&s?-1:1)}return x}async function b(t,e){var n;void 0===e&&(e={});const{x:o,y:i,platform:r,rects:l,elements:c,strategy:a}=t,{boundary:f="clippingAncestors",rootBoundary:u="viewport",elementContext:d="floating",altBoundary:p=!1,padding:m=0}=s(e,t),h=x(m),g=c[p?"floating"===d?"reference":"floating":d],y=w(await r.getClippingRect({element:null==(n=await(null==r.isElement?void 0:r.isElement(g)))||n?g:g.contextElement||await(null==r.getDocumentElement?void 0:r.getDocumentElement(c.floating)),boundary:f,rootBoundary:u,strategy:a})),v="floating"===d?{...l.floating,x:o,y:i}:l.reference,b=await(null==r.getOffsetParent?void 0:r.getOffsetParent(c.floating)),T=await(null==r.isElement?void 0:r.isElement(b))&&await(null==r.getScale?void 0:r.getScale(b))||{x:1,y:1},R=w(r.convertOffsetParentRelativeRectToViewportRelativeRect?await r.convertOffsetParentRelativeRectToViewportRelativeRect({elements:c,rect:v,offsetParent:b,strategy:a}):v);return{top:(y.top-R.top+h.top)/T.y,bottom:(R.bottom-y.bottom+h.bottom)/T.y,left:(y.left-R.left+h.left)/T.x,right:(R.right-y.right+h.right)/T.x}}const T=function(t){return void 0===t&&(t=0),{name:"offset",options:t,async fn(e){var n,o;const{x:i,y:r,placement:l,middlewareData:c}=e,a=await async function(t,e){const{placement:n,platform:o,elements:i}=t,r=await(null==o.isRTL?void 0:o.isRTL(i.floating)),l=f(n),c=u(n),a="y"===m(n),d=["left","top"].includes(l)?-1:1,p=r&&a?-1:1,h=s(e,t);let{mainAxis:g,crossAxis:y,alignmentAxis:x}="number"==typeof h?{mainAxis:h,crossAxis:0,alignmentAxis:null}:{mainAxis:0,crossAxis:0,alignmentAxis:null,...h};return c&&"number"==typeof x&&(y="end"===c?-1*x:x),a?{x:y*p,y:g*d}:{x:g*d,y:y*p}}(e,t);return l===(null==(n=c.offset)?void 0:n.placement)&&null!=(o=c.arrow)&&o.alignmentOffset?{}:{x:i+a.x,y:r+a.y,data:{...a,placement:l}}}}};function R(t){return O(t)?(t.nodeName||"").toLowerCase():"#document"}function L(t){var e;return(null==t||null==(e=t.ownerDocument)?void 0:e.defaultView)||window}function E(t){var e;return null==(e=(O(t)?t.ownerDocument:t.document)||window.document)?void 0:e.documentElement}function O(t){return t instanceof Node||t instanceof L(t).Node}function D(t){return t instanceof Element||t instanceof L(t).Element}function S(t){return t instanceof HTMLElement||t instanceof L(t).HTMLElement}function A(t){return"undefined"!=typeof ShadowRoot&&(t instanceof ShadowRoot||t instanceof L(t).ShadowRoot)}function P(t){const{overflow:e,overflowX:n,overflowY:o,display:i}=W(t);return/auto|scroll|overlay|hidden|clip/.test(e+o+n)&&!["inline","contents"].includes(i)}function k(t){return["table","td","th"].includes(R(t))}function C(t){const e=F(),n=W(t);return"none"!==n.transform||"none"!==n.perspective||!!n.containerType&&"normal"!==n.containerType||!e&&!!n.backdropFilter&&"none"!==n.backdropFilter||!e&&!!n.filter&&"none"!==n.filter||["transform","perspective","filter"].some((t=>(n.willChange||"").includes(t)))||["paint","layout","strict","content"].some((t=>(n.contain||"").includes(t)))}function F(){return!("undefined"==typeof CSS||!CSS.supports)&&CSS.supports("-webkit-backdrop-filter","none")}function H(t){return["html","body","#document"].includes(R(t))}function W(t){return L(t).getComputedStyle(t)}function V(t){return D(t)?{scrollLeft:t.scrollLeft,scrollTop:t.scrollTop}:{scrollLeft:t.pageXOffset,scrollTop:t.pageYOffset}}function B(t){if("html"===R(t))return t;const e=t.assignedSlot||t.parentNode||A(t)&&t.host||E(t);return A(e)?e.host:e}function M(t){const e=B(t);return H(e)?t.ownerDocument?t.ownerDocument.body:t.body:S(e)&&P(e)?e:M(e)}function N(t,e,n){var o;void 0===e&&(e=[]),void 0===n&&(n=!0);const i=M(t),r=i===(null==(o=t.ownerDocument)?void 0:o.body),l=L(i);return r?e.concat(l,l.visualViewport||[],P(i)?i:[],l.frameElement&&n?N(l.frameElement):[]):e.concat(i,N(i,[],n))}function j(t){const e=W(t);let n=parseFloat(e.width)||0,o=parseFloat(e.height)||0;const r=S(t),l=r?t.offsetWidth:n,c=r?t.offsetHeight:o,a=i(n)!==l||i(o)!==c;return a&&(n=l,o=c),{width:n,height:o,$:a}}function q(t){return D(t)?t:t.contextElement}function X(t){const e=q(t);if(!S(e))return r(1);const n=e.getBoundingClientRect(),{width:o,height:l,$:c}=j(e);let a=(c?i(n.width):n.width)/o,s=(c?i(n.height):n.height)/l;return a&&Number.isFinite(a)||(a=1),s&&Number.isFinite(s)||(s=1),{x:a,y:s}}const Y=r(0);function $(t){const e=L(t);return F()&&e.visualViewport?{x:e.visualViewport.offsetLeft,y:e.visualViewport.offsetTop}:Y}function _(t,e,n,o){void 0===e&&(e=!1),void 0===n&&(n=!1);const i=t.getBoundingClientRect(),l=q(t);let c=r(1);e&&(o?D(o)&&(c=X(o)):c=X(t));const a=function(t,e,n){return void 0===e&&(e=!1),!(!n||e&&n!==L(t))&&e}(l,n,o)?$(l):r(0);let s=(i.left+a.x)/c.x,f=(i.top+a.y)/c.y,u=i.width/c.x,d=i.height/c.y;if(l){const t=L(l),e=o&&D(o)?L(o):o;let n=t,i=n.frameElement;for(;i&&o&&e!==n;){const t=X(i),e=i.getBoundingClientRect(),o=W(i),r=e.left+(i.clientLeft+parseFloat(o.paddingLeft))*t.x,l=e.top+(i.clientTop+parseFloat(o.paddingTop))*t.y;s*=t.x,f*=t.y,u*=t.x,d*=t.y,s+=r,f+=l,n=L(i),i=n.frameElement}}return w({width:u,height:d,x:s,y:f})}const z=[":popover-open",":modal"];function G(t){return z.some((e=>{try{return t.matches(e)}catch(t){return!1}}))}function I(t){return _(E(t)).left+V(t).scrollLeft}function J(t,e,n){let i;if("viewport"===e)i=function(t,e){const n=L(t),o=E(t),i=n.visualViewport;let r=o.clientWidth,l=o.clientHeight,c=0,a=0;if(i){r=i.width,l=i.height;const t=F();(!t||t&&"fixed"===e)&&(c=i.offsetLeft,a=i.offsetTop)}return{width:r,height:l,x:c,y:a}}(t,n);else if("document"===e)i=function(t){const e=E(t),n=V(t),i=t.ownerDocument.body,r=o(e.scrollWidth,e.clientWidth,i.scrollWidth,i.clientWidth),l=o(e.scrollHeight,e.clientHeight,i.scrollHeight,i.clientHeight);let c=-n.scrollLeft+I(t);const a=-n.scrollTop;return"rtl"===W(i).direction&&(c+=o(e.clientWidth,i.clientWidth)-r),{width:r,height:l,x:c,y:a}}(E(t));else if(D(e))i=function(t,e){const n=_(t,!0,"fixed"===e),o=n.top+t.clientTop,i=n.left+t.clientLeft,l=S(t)?X(t):r(1);return{width:t.clientWidth*l.x,height:t.clientHeight*l.y,x:i*l.x,y:o*l.y}}(e,n);else{const n=$(t);i={...e,x:e.x-n.x,y:e.y-n.y}}return w(i)}function K(t,e){const n=B(t);return!(n===e||!D(n)||H(n))&&("fixed"===W(n).position||K(n,e))}function Q(t,e,n){const o=S(e),i=E(e),l="fixed"===n,c=_(t,!0,l,e);let a={scrollLeft:0,scrollTop:0};const s=r(0);if(o||!o&&!l)if(("body"!==R(e)||P(i))&&(a=V(e)),o){const t=_(e,!0,l,e);s.x=t.x+e.clientLeft,s.y=t.y+e.clientTop}else i&&(s.x=I(i));return{x:c.left+a.scrollLeft-s.x,y:c.top+a.scrollTop-s.y,width:c.width,height:c.height}}function U(t,e){return S(t)&&"fixed"!==W(t).position?e?e(t):t.offsetParent:null}function Z(t,e){const n=L(t);if(!S(t)||G(t))return n;let o=U(t,e);for(;o&&k(o)&&"static"===W(o).position;)o=U(o,e);return o&&("html"===R(o)||"body"===R(o)&&"static"===W(o).position&&!C(o))?n:o||function(t){let e=B(t);for(;S(e)&&!H(e);){if(C(e))return e;e=B(e)}return null}(t)||n}const tt={convertOffsetParentRelativeRectToViewportRelativeRect:function(t){let{elements:e,rect:n,offsetParent:o,strategy:i}=t;const l="fixed"===i,c=E(o),a=!!e&&G(e.floating);if(o===c||a&&l)return n;let s={scrollLeft:0,scrollTop:0},f=r(1);const u=r(0),d=S(o);if((d||!d&&!l)&&(("body"!==R(o)||P(c))&&(s=V(o)),S(o))){const t=_(o);f=X(o),u.x=t.x+o.clientLeft,u.y=t.y+o.clientTop}return{width:n.width*f.x,height:n.height*f.y,x:n.x*f.x-s.scrollLeft*f.x+u.x,y:n.y*f.y-s.scrollTop*f.y+u.y}},getDocumentElement:E,getClippingRect:function(t){let{element:e,boundary:i,rootBoundary:r,strategy:l}=t;const c=[..."clippingAncestors"===i?function(t,e){const n=e.get(t);if(n)return n;let o=N(t,[],!1).filter((t=>D(t)&&"body"!==R(t))),i=null;const r="fixed"===W(t).position;let l=r?B(t):t;for(;D(l)&&!H(l);){const e=W(l),n=C(l);n||"fixed"!==e.position||(i=null),(r?!n&&!i:!n&&"static"===e.position&&i&&["absolute","fixed"].includes(i.position)||P(l)&&!n&&K(t,l))?o=o.filter((t=>t!==l)):i=e,l=B(l)}return e.set(t,o),o}(e,this._c):[].concat(i),r],a=c[0],s=c.reduce(((t,i)=>{const r=J(e,i,l);return t.top=o(r.top,t.top),t.right=n(r.right,t.right),t.bottom=n(r.bottom,t.bottom),t.left=o(r.left,t.left),t}),J(e,a,l));return{width:s.right-s.left,height:s.bottom-s.top,x:s.left,y:s.top}},getOffsetParent:Z,getElementRects:async function(t){const e=this.getOffsetParent||Z,n=this.getDimensions;return{reference:Q(t.reference,await e(t.floating),t.strategy),floating:{x:0,y:0,...await n(t.floating)}}},getClientRects:function(t){return Array.from(t.getClientRects())},getDimensions:function(t){const{width:e,height:n}=j(t);return{width:e,height:n}},getScale:X,isElement:D,isRTL:function(t){return"rtl"===W(t).direction}},et=function(t){return void 0===t&&(t={}),{name:"shift",options:t,async fn(e){const{x:n,y:o,placement:i}=e,{mainAxis:r=!0,crossAxis:l=!1,limiter:c={fn:t=>{let{x:e,y:n}=t;return{x:e,y:n}}},...u}=s(t,e),p={x:n,y:o},h=await b(e,u),g=m(f(i)),y=d(g);let x=p[y],w=p[g];if(r){const t="y"===y?"bottom":"right";x=a(x+h["y"===y?"top":"left"],x,x-h[t])}if(l){const t="y"===g?"bottom":"right";w=a(w+h["y"===g?"top":"left"],w,w-h[t])}const v=c.fn({...e,[y]:x,[g]:w});return{...v,data:{x:v.x-n,y:v.y-o}}}}},nt=t=>({name:"arrow",options:t,async fn(e){const{x:o,y:i,placement:r,rects:l,platform:c,elements:f,middlewareData:d}=e,{element:m,padding:g=0}=s(t,e)||{};if(null==m)return{};const y=x(g),w={x:o,y:i},v=h(r),b=p(v),T=await c.getDimensions(m),R="y"===v,L=R?"top":"left",E=R?"bottom":"right",O=R?"clientHeight":"clientWidth",D=l.reference[b]+l.reference[v]-w[v]-l.floating[b],S=w[v]-l.reference[v],A=await(null==c.getOffsetParent?void 0:c.getOffsetParent(m));let P=A?A[O]:0;P&&await(null==c.isElement?void 0:c.isElement(A))||(P=f.floating[O]||l.floating[b]);const k=D/2-S/2,C=P/2-T[b]/2-1,F=n(y[L],C),H=n(y[E],C),W=F,V=P-T[b]-H,B=P/2-T[b]/2+k,M=a(W,B,V),N=!d.arrow&&null!=u(r)&&B!==M&&l.reference[b]/2-(B<W?F:H)-T[b]/2<0,j=N?B<W?B-W:B-V:0;return{[v]:w[v]+j,data:{[v]:M,centerOffset:B-M-j,...N&&{alignmentOffset:j}},reset:N}}});var ot=function(){function t(){}return t.prototype.setTooltip=function(t,e,n,o){var i=this;void 0===n&&(n="top"),void 0===o&&(o=6);var r=document.querySelector(t),l=document.querySelector(e),c=document.querySelector("".concat(e,">.arrow"));this.updateTooltip(r,l,c,n,o),r.addEventListener("mouseenter",(function(){i.showTooltip(r,l,c,n,o)})),r.addEventListener("focus",(function(){i.showTooltip(r,l,c,n,o)})),r.addEventListener("mouseleave",(function(){i.hideTooltip(l)})),r.addEventListener("blur",(function(){i.hideTooltip(l)}))},t.prototype.updateTooltip=function(t,e,n,o,i){var r;((t,e,n)=>{const o=new Map,i={platform:tt,...n},r={...i.platform,_c:o};return(async(t,e,n)=>{const{placement:o="bottom",strategy:i="absolute",middleware:r=[],platform:l}=n,c=r.filter(Boolean),a=await(null==l.isRTL?void 0:l.isRTL(e));let s=await l.getElementRects({reference:t,floating:e,strategy:i}),{x:f,y:u}=v(s,o,a),d=o,p={},m=0;for(let n=0;n<c.length;n++){const{name:r,fn:h}=c[n],{x:g,y,data:x,reset:w}=await h({x:f,y:u,initialPlacement:o,placement:d,strategy:i,middlewareData:p,rects:s,platform:l,elements:{reference:t,floating:e}});f=null!=g?g:f,u=null!=y?y:u,p={...p,[r]:{...p[r],...x}},w&&m<=50&&(m++,"object"==typeof w&&(w.placement&&(d=w.placement),w.rects&&(s=!0===w.rects?await l.getElementRects({reference:t,floating:e,strategy:i}):w.rects),({x:f,y:u}=v(s,d,a))),n=-1)}return{x:f,y:u,placement:d,strategy:i,middlewareData:p}})(t,e,{...i,platform:r})})(t,e,{placement:o,middleware:[(void 0===r&&(r={}),{name:"flip",options:r,async fn(t){var e,n;const{placement:o,middlewareData:i,rects:l,initialPlacement:c,platform:a,elements:d}=t,{mainAxis:m=!0,crossAxis:x=!0,fallbackPlacements:w,fallbackStrategy:v="bestFit",fallbackAxisSideDirection:T="none",flipAlignment:R=!0,...L}=s(r,t);if(null!=(e=i.arrow)&&e.alignmentOffset)return{};const E=f(o),O=f(c)===c,D=await(null==a.isRTL?void 0:a.isRTL(d.floating)),S=w||(O||!R?[y(c)]:function(t){const e=y(t);return[g(t),e,g(e)]}(c));w||"none"===T||S.push(...function(t,e,n,o){const i=u(t);let r=function(t,e,n){const o=["left","right"],i=["right","left"],r=["top","bottom"],l=["bottom","top"];switch(t){case"top":case"bottom":return n?e?i:o:e?o:i;case"left":case"right":return e?r:l;default:return[]}}(f(t),"start"===n,o);return i&&(r=r.map((t=>t+"-"+i)),e&&(r=r.concat(r.map(g)))),r}(c,R,T,D));const A=[c,...S],P=await b(t,L),k=[];let C=(null==(n=i.flip)?void 0:n.overflows)||[];if(m&&k.push(P[E]),x){const t=function(t,e,n){void 0===n&&(n=!1);const o=u(t),i=h(t),r=p(i);let l="x"===i?o===(n?"end":"start")?"right":"left":"start"===o?"bottom":"top";return e.reference[r]>e.floating[r]&&(l=y(l)),[l,y(l)]}(o,l,D);k.push(P[t[0]],P[t[1]])}if(C=[...C,{placement:o,overflows:k}],!k.every((t=>t<=0))){var F,H;const t=((null==(F=i.flip)?void 0:F.index)||0)+1,e=A[t];if(e)return{data:{index:t,overflows:C},reset:{placement:e}};let n=null==(H=C.filter((t=>t.overflows[0]<=0)).sort(((t,e)=>t.overflows[1]-e.overflows[1]))[0])?void 0:H.placement;if(!n)switch(v){case"bestFit":{var W;const t=null==(W=C.map((t=>[t.placement,t.overflows.filter((t=>t>0)).reduce(((t,e)=>t+e),0)])).sort(((t,e)=>t[1]-e[1]))[0])?void 0:W[0];t&&(n=t);break}case"initialPlacement":n=c}if(o!==n)return{reset:{placement:n}}}return{}}}),et({padding:5}),T(i),nt({element:n})]}).then((function(t){var o,i=t.x,r=t.y,l=t.placement,c=t.middlewareData;Object.assign(e.style,{left:"".concat(i,"px"),top:"".concat(r,"px")});var a=c.arrow,s=a.x,f=a.y,u={top:"bottom",right:"left",bottom:"top",left:"right"}[l.split("-")[0]];Object.assign(n.style,((o={left:null!=s?"".concat(s,"px"):"",top:null!=f?"".concat(f,"px"):"",right:"",bottom:""})[u]="-4px",o))}))},t.prototype.showTooltip=function(t,e,n,o,i){e.style.display="block",this.updateTooltip(t,e,n,o,i)},t.prototype.hideTooltip=function(t){t.style.display=""},t.create=function(){return new t},t}(),it=e.m;export{it as Tooltip};
//# sourceMappingURL=bluent.ui.js.map