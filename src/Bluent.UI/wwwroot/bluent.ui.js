var t={d:(e,n)=>{for(var o in n)t.o(n,o)&&!t.o(e,o)&&Object.defineProperty(e,o,{enumerable:!0,get:n[o]})},o:(t,e)=>Object.prototype.hasOwnProperty.call(t,e)},e={};t.d(e,{nE:()=>n,AM:()=>lt,Sx:()=>ct});var n=function(){function t(){}return t.prototype.init=function(t){if(this._element=document.getElementById(t),this._element){var e=this._element.querySelector(":scope > .overflow-button");this._overflowMenu=document.querySelector("#".concat(e.id,"_surface>.overflow-menu")),this._isHorizontal=this._element.classList.contains("horizontal"),this.getOverflowButtonDimention(e),new ResizeObserver(this.onSizeChanged.bind(this)).observe(this._element)}this.checkOverflow()},t.prototype.checkOverflow=function(){var t=Array.from(this._element.children).filter((function(t){return!t.classList.contains("overflow-button")})),e=Array.from(this._overflowMenu.children);this.clearOverflowingItems(t),this.clearOverflowingItems(e);var n=this.getFirstOverflowIndex(t);this.setOverflowingItems(n,t),this.setOverflowingItems(n,e)},t.prototype.getOverflowButtonDimention=function(t){t.style.display="inline-flex",this._overflowButtonWidth=t.clientWidth,this._overflowButtonHeight=t.clientHeight,t.style.display=""},t.prototype.setOverflowingItems=function(t,e){if(-1!=t)for(var n=t;n<e.length;n++)e[n].classList.add("overflowing")},t.prototype.getFirstOverflowIndex=function(t){if(this._isHorizontal)for(var e=parseInt(window.getComputedStyle(this._element,null).getPropertyValue("padding-inline-start")),n=parseInt(window.getComputedStyle(this._element,null).getPropertyValue("padding-inline-end")),o=this._element.clientWidth-e-n,i=0;i<t.length;i++){var r=t[i];if(this.getOffsetEnd(r)-e+this._overflowButtonWidth>o)return i}else{var l=parseInt(window.getComputedStyle(this._element,null).getPropertyValue("padding-top")),c=parseInt(window.getComputedStyle(this._element,null).getPropertyValue("padding-bottom")),s=this._element.clientHeight-l-c;for(i=0;i<t.length;i++)if((r=t[i]).offsetTop+r.offsetHeight-l+this._overflowButtonHeight>s)return i}return-1},t.prototype.clearOverflowingItems=function(t){t.forEach((function(t){return t.classList.remove("overflowing")}))},t.prototype.getOffsetEnd=function(t){var e=window.getComputedStyle(t.parentElement).getPropertyValue("direction"),n=t.parentElement.getBoundingClientRect(),o=t.getBoundingClientRect();return"ltr"===e?o.left-n.left+o.width:n.right-o.right+o.width},t.prototype.onSizeChanged=function(){this.checkOverflow()},t.create=function(){return new t},t}();const o=Math.min,i=Math.max,r=Math.round,l=(Math.floor,t=>({x:t,y:t})),c={left:"right",right:"left",bottom:"top",top:"bottom"},s={start:"end",end:"start"};function a(t,e,n){return i(t,o(e,n))}function f(t,e){return"function"==typeof t?t(e):t}function u(t){return t.split("-")[0]}function d(t){return t.split("-")[1]}function h(t){return"x"===t?"y":"x"}function p(t){return"y"===t?"height":"width"}function m(t){return["top","bottom"].includes(u(t))?"y":"x"}function g(t){return h(m(t))}function y(t){return t.replace(/start|end/g,(t=>s[t]))}function w(t){return t.replace(/left|right|bottom|top/g,(t=>c[t]))}function v(t){return"number"!=typeof t?function(t){return{top:0,right:0,bottom:0,left:0,...t}}(t):{top:t,right:t,bottom:t,left:t}}function x(t){return{...t,top:t.y,left:t.x,right:t.x+t.width,bottom:t.y+t.height}}function b(t,e,n){let{reference:o,floating:i}=t;const r=m(e),l=g(e),c=p(l),s=u(e),a="y"===r,f=o.x+o.width/2-i.width/2,h=o.y+o.height/2-i.height/2,y=o[c]/2-i[c]/2;let w;switch(s){case"top":w={x:f,y:o.y-i.height};break;case"bottom":w={x:f,y:o.y+o.height};break;case"right":w={x:o.x+o.width,y:h};break;case"left":w={x:o.x-i.width,y:h};break;default:w={x:o.x,y:o.y}}switch(d(e)){case"start":w[l]-=y*(n&&a?-1:1);break;case"end":w[l]+=y*(n&&a?-1:1)}return w}async function S(t,e){var n;void 0===e&&(e={});const{x:o,y:i,platform:r,rects:l,elements:c,strategy:s}=t,{boundary:a="clippingAncestors",rootBoundary:u="viewport",elementContext:d="floating",altBoundary:h=!1,padding:p=0}=f(e,t),m=v(p),g=c[h?"floating"===d?"reference":"floating":d],y=x(await r.getClippingRect({element:null==(n=await(null==r.isElement?void 0:r.isElement(g)))||n?g:g.contextElement||await(null==r.getDocumentElement?void 0:r.getDocumentElement(c.floating)),boundary:a,rootBoundary:u,strategy:s})),w="floating"===d?{...l.floating,x:o,y:i}:l.reference,b=await(null==r.getOffsetParent?void 0:r.getOffsetParent(c.floating)),S=await(null==r.isElement?void 0:r.isElement(b))&&await(null==r.getScale?void 0:r.getScale(b))||{x:1,y:1},E=x(r.convertOffsetParentRelativeRectToViewportRelativeRect?await r.convertOffsetParentRelativeRectToViewportRelativeRect({elements:c,rect:w,offsetParent:b,strategy:s}):w);return{top:(y.top-E.top+m.top)/S.y,bottom:(E.bottom-y.bottom+m.bottom)/S.y,left:(y.left-E.left+m.left)/S.x,right:(E.right-y.right+m.right)/S.x}}const E=function(t){return void 0===t&&(t=0),{name:"offset",options:t,async fn(e){var n,o;const{x:i,y:r,placement:l,middlewareData:c}=e,s=await async function(t,e){const{placement:n,platform:o,elements:i}=t,r=await(null==o.isRTL?void 0:o.isRTL(i.floating)),l=u(n),c=d(n),s="y"===m(n),a=["left","top"].includes(l)?-1:1,h=r&&s?-1:1,p=f(e,t);let{mainAxis:g,crossAxis:y,alignmentAxis:w}="number"==typeof p?{mainAxis:p,crossAxis:0,alignmentAxis:null}:{mainAxis:0,crossAxis:0,alignmentAxis:null,...p};return c&&"number"==typeof w&&(y="end"===c?-1*w:w),s?{x:y*h,y:g*a}:{x:g*a,y:y*h}}(e,t);return l===(null==(n=c.offset)?void 0:n.placement)&&null!=(o=c.arrow)&&o.alignmentOffset?{}:{x:i+s.x,y:r+s.y,data:{...s,placement:l}}}}};function L(t){return O(t)?(t.nodeName||"").toLowerCase():"#document"}function R(t){var e;return(null==t||null==(e=t.ownerDocument)?void 0:e.defaultView)||window}function T(t){var e;return null==(e=(O(t)?t.ownerDocument:t.document)||window.document)?void 0:e.documentElement}function O(t){return t instanceof Node||t instanceof R(t).Node}function A(t){return t instanceof Element||t instanceof R(t).Element}function k(t){return t instanceof HTMLElement||t instanceof R(t).HTMLElement}function _(t){return"undefined"!=typeof ShadowRoot&&(t instanceof ShadowRoot||t instanceof R(t).ShadowRoot)}function C(t){const{overflow:e,overflowX:n,overflowY:o,display:i}=I(t);return/auto|scroll|overlay|hidden|clip/.test(e+o+n)&&!["inline","contents"].includes(i)}function D(t){return["table","td","th"].includes(L(t))}function P(t){const e=H(),n=I(t);return"none"!==n.transform||"none"!==n.perspective||!!n.containerType&&"normal"!==n.containerType||!e&&!!n.backdropFilter&&"none"!==n.backdropFilter||!e&&!!n.filter&&"none"!==n.filter||["transform","perspective","filter"].some((t=>(n.willChange||"").includes(t)))||["paint","layout","strict","content"].some((t=>(n.contain||"").includes(t)))}function H(){return!("undefined"==typeof CSS||!CSS.supports)&&CSS.supports("-webkit-backdrop-filter","none")}function B(t){return["html","body","#document"].includes(L(t))}function I(t){return R(t).getComputedStyle(t)}function M(t){return A(t)?{scrollLeft:t.scrollLeft,scrollTop:t.scrollTop}:{scrollLeft:t.pageXOffset,scrollTop:t.pageYOffset}}function V(t){if("html"===L(t))return t;const e=t.assignedSlot||t.parentNode||_(t)&&t.host||T(t);return _(e)?e.host:e}function W(t){const e=V(t);return B(e)?t.ownerDocument?t.ownerDocument.body:t.body:k(e)&&C(e)?e:W(e)}function F(t,e,n){var o;void 0===e&&(e=[]),void 0===n&&(n=!0);const i=W(t),r=i===(null==(o=t.ownerDocument)?void 0:o.body),l=R(i);return r?e.concat(l,l.visualViewport||[],C(i)?i:[],l.frameElement&&n?F(l.frameElement):[]):e.concat(i,F(i,[],n))}function N(t){const e=I(t);let n=parseFloat(e.width)||0,o=parseFloat(e.height)||0;const i=k(t),l=i?t.offsetWidth:n,c=i?t.offsetHeight:o,s=r(n)!==l||r(o)!==c;return s&&(n=l,o=c),{width:n,height:o,$:s}}function q(t){return A(t)?t:t.contextElement}function z(t){const e=q(t);if(!k(e))return l(1);const n=e.getBoundingClientRect(),{width:o,height:i,$:c}=N(e);let s=(c?r(n.width):n.width)/o,a=(c?r(n.height):n.height)/i;return s&&Number.isFinite(s)||(s=1),a&&Number.isFinite(a)||(a=1),{x:s,y:a}}const j=l(0);function X(t){const e=R(t);return H()&&e.visualViewport?{x:e.visualViewport.offsetLeft,y:e.visualViewport.offsetTop}:j}function Y(t,e,n,o){void 0===e&&(e=!1),void 0===n&&(n=!1);const i=t.getBoundingClientRect(),r=q(t);let c=l(1);e&&(o?A(o)&&(c=z(o)):c=z(t));const s=function(t,e,n){return void 0===e&&(e=!1),!(!n||e&&n!==R(t))&&e}(r,n,o)?X(r):l(0);let a=(i.left+s.x)/c.x,f=(i.top+s.y)/c.y,u=i.width/c.x,d=i.height/c.y;if(r){const t=R(r),e=o&&A(o)?R(o):o;let n=t,i=n.frameElement;for(;i&&o&&e!==n;){const t=z(i),e=i.getBoundingClientRect(),o=I(i),r=e.left+(i.clientLeft+parseFloat(o.paddingLeft))*t.x,l=e.top+(i.clientTop+parseFloat(o.paddingTop))*t.y;a*=t.x,f*=t.y,u*=t.x,d*=t.y,a+=r,f+=l,n=R(i),i=n.frameElement}}return x({width:u,height:d,x:a,y:f})}const $=[":popover-open",":modal"];function G(t){return $.some((e=>{try{return t.matches(e)}catch(t){return!1}}))}function J(t){return Y(T(t)).left+M(t).scrollLeft}function K(t,e,n){let o;if("viewport"===e)o=function(t,e){const n=R(t),o=T(t),i=n.visualViewport;let r=o.clientWidth,l=o.clientHeight,c=0,s=0;if(i){r=i.width,l=i.height;const t=H();(!t||t&&"fixed"===e)&&(c=i.offsetLeft,s=i.offsetTop)}return{width:r,height:l,x:c,y:s}}(t,n);else if("document"===e)o=function(t){const e=T(t),n=M(t),o=t.ownerDocument.body,r=i(e.scrollWidth,e.clientWidth,o.scrollWidth,o.clientWidth),l=i(e.scrollHeight,e.clientHeight,o.scrollHeight,o.clientHeight);let c=-n.scrollLeft+J(t);const s=-n.scrollTop;return"rtl"===I(o).direction&&(c+=i(e.clientWidth,o.clientWidth)-r),{width:r,height:l,x:c,y:s}}(T(t));else if(A(e))o=function(t,e){const n=Y(t,!0,"fixed"===e),o=n.top+t.clientTop,i=n.left+t.clientLeft,r=k(t)?z(t):l(1);return{width:t.clientWidth*r.x,height:t.clientHeight*r.y,x:i*r.x,y:o*r.y}}(e,n);else{const n=X(t);o={...e,x:e.x-n.x,y:e.y-n.y}}return x(o)}function Q(t,e){const n=V(t);return!(n===e||!A(n)||B(n))&&("fixed"===I(n).position||Q(n,e))}function U(t,e,n){const o=k(e),i=T(e),r="fixed"===n,c=Y(t,!0,r,e);let s={scrollLeft:0,scrollTop:0};const a=l(0);if(o||!o&&!r)if(("body"!==L(e)||C(i))&&(s=M(e)),o){const t=Y(e,!0,r,e);a.x=t.x+e.clientLeft,a.y=t.y+e.clientTop}else i&&(a.x=J(i));return{x:c.left+s.scrollLeft-a.x,y:c.top+s.scrollTop-a.y,width:c.width,height:c.height}}function Z(t,e){return k(t)&&"fixed"!==I(t).position?e?e(t):t.offsetParent:null}function tt(t,e){const n=R(t);if(!k(t)||G(t))return n;let o=Z(t,e);for(;o&&D(o)&&"static"===I(o).position;)o=Z(o,e);return o&&("html"===L(o)||"body"===L(o)&&"static"===I(o).position&&!P(o))?n:o||function(t){let e=V(t);for(;k(e)&&!B(e);){if(P(e))return e;e=V(e)}return null}(t)||n}const et={convertOffsetParentRelativeRectToViewportRelativeRect:function(t){let{elements:e,rect:n,offsetParent:o,strategy:i}=t;const r="fixed"===i,c=T(o),s=!!e&&G(e.floating);if(o===c||s&&r)return n;let a={scrollLeft:0,scrollTop:0},f=l(1);const u=l(0),d=k(o);if((d||!d&&!r)&&(("body"!==L(o)||C(c))&&(a=M(o)),k(o))){const t=Y(o);f=z(o),u.x=t.x+o.clientLeft,u.y=t.y+o.clientTop}return{width:n.width*f.x,height:n.height*f.y,x:n.x*f.x-a.scrollLeft*f.x+u.x,y:n.y*f.y-a.scrollTop*f.y+u.y}},getDocumentElement:T,getClippingRect:function(t){let{element:e,boundary:n,rootBoundary:r,strategy:l}=t;const c=[..."clippingAncestors"===n?function(t,e){const n=e.get(t);if(n)return n;let o=F(t,[],!1).filter((t=>A(t)&&"body"!==L(t))),i=null;const r="fixed"===I(t).position;let l=r?V(t):t;for(;A(l)&&!B(l);){const e=I(l),n=P(l);n||"fixed"!==e.position||(i=null),(r?!n&&!i:!n&&"static"===e.position&&i&&["absolute","fixed"].includes(i.position)||C(l)&&!n&&Q(t,l))?o=o.filter((t=>t!==l)):i=e,l=V(l)}return e.set(t,o),o}(e,this._c):[].concat(n),r],s=c[0],a=c.reduce(((t,n)=>{const r=K(e,n,l);return t.top=i(r.top,t.top),t.right=o(r.right,t.right),t.bottom=o(r.bottom,t.bottom),t.left=i(r.left,t.left),t}),K(e,s,l));return{width:a.right-a.left,height:a.bottom-a.top,x:a.left,y:a.top}},getOffsetParent:tt,getElementRects:async function(t){const e=this.getOffsetParent||tt,n=this.getDimensions;return{reference:U(t.reference,await e(t.floating),t.strategy),floating:{x:0,y:0,...await n(t.floating)}}},getClientRects:function(t){return Array.from(t.getClientRects())},getDimensions:function(t){const{width:e,height:n}=N(t);return{width:e,height:n}},getScale:z,isElement:A,isRTL:function(t){return"rtl"===I(t).direction}},nt=function(t){return void 0===t&&(t={}),{name:"shift",options:t,async fn(e){const{x:n,y:o,placement:i}=e,{mainAxis:r=!0,crossAxis:l=!1,limiter:c={fn:t=>{let{x:e,y:n}=t;return{x:e,y:n}}},...s}=f(t,e),d={x:n,y:o},p=await S(e,s),g=m(u(i)),y=h(g);let w=d[y],v=d[g];if(r){const t="y"===y?"bottom":"right";w=a(w+p["y"===y?"top":"left"],w,w-p[t])}if(l){const t="y"===g?"bottom":"right";v=a(v+p["y"===g?"top":"left"],v,v-p[t])}const x=c.fn({...e,[y]:w,[g]:v});return{...x,data:{x:x.x-n,y:x.y-o}}}}},ot=t=>({name:"arrow",options:t,async fn(e){const{x:n,y:i,placement:r,rects:l,platform:c,elements:s,middlewareData:u}=e,{element:h,padding:m=0}=f(t,e)||{};if(null==h)return{};const y=v(m),w={x:n,y:i},x=g(r),b=p(x),S=await c.getDimensions(h),E="y"===x,L=E?"top":"left",R=E?"bottom":"right",T=E?"clientHeight":"clientWidth",O=l.reference[b]+l.reference[x]-w[x]-l.floating[b],A=w[x]-l.reference[x],k=await(null==c.getOffsetParent?void 0:c.getOffsetParent(h));let _=k?k[T]:0;_&&await(null==c.isElement?void 0:c.isElement(k))||(_=s.floating[T]||l.floating[b]);const C=O/2-A/2,D=_/2-S[b]/2-1,P=o(y[L],D),H=o(y[R],D),B=P,I=_-S[b]-H,M=_/2-S[b]/2+C,V=a(B,M,I),W=!u.arrow&&null!=d(r)&&M!==V&&l.reference[b]/2-(M<B?P:H)-S[b]/2<0,F=W?M<B?M-B:M-I:0;return{[x]:w[x]+F,data:{[x]:V,centerOffset:M-V-F,...W&&{alignmentOffset:F}},reset:W}}});var it=function(t,e,n,o){return new(n||(n=Promise))((function(i,r){function l(t){try{s(o.next(t))}catch(t){r(t)}}function c(t){try{s(o.throw(t))}catch(t){r(t)}}function s(t){var e;t.done?i(t.value):(e=t.value,e instanceof n?e:new n((function(t){t(e)}))).then(l,c)}s((o=o.apply(t,e||[])).next())}))},rt=function(t,e){var n,o,i,r,l={label:0,sent:function(){if(1&i[0])throw i[1];return i[1]},trys:[],ops:[]};return r={next:c(0),throw:c(1),return:c(2)},"function"==typeof Symbol&&(r[Symbol.iterator]=function(){return this}),r;function c(c){return function(s){return function(c){if(n)throw new TypeError("Generator is already executing.");for(;r&&(r=0,c[0]&&(l=0)),l;)try{if(n=1,o&&(i=2&c[0]?o.return:c[0]?o.throw||((i=o.return)&&i.call(o),0):o.next)&&!(i=i.call(o,c[1])).done)return i;switch(o=0,i&&(c=[2&c[0],i.value]),c[0]){case 0:case 1:i=c;break;case 4:return l.label++,{value:c[1],done:!1};case 5:l.label++,o=c[1],c=[0];continue;case 7:c=l.ops.pop(),l.trys.pop();continue;default:if(!((i=(i=l.trys).length>0&&i[i.length-1])||6!==c[0]&&2!==c[0])){l=0;continue}if(3===c[0]&&(!i||c[1]>i[0]&&c[1]<i[3])){l.label=c[1];break}if(6===c[0]&&l.label<i[1]){l.label=i[1],i=c;break}if(i&&l.label<i[2]){l.label=i[2],l.ops.push(c);break}i[2]&&l.ops.pop(),l.trys.pop();continue}c=e.call(t,l)}catch(t){c=[6,t],o=0}finally{n=i=0}if(5&c[0])throw c[1];return{value:c[0]?c[1]:void 0,done:!0}}([c,s])}}},lt=function(){function t(t){this._dotNetRef=t}return t.prototype.setPopover=function(t){var e=this,n=this.getTrigger(t);n&&(t.triggerEvents&&t.triggerEvents.forEach((function(o){n.addEventListener(o,(function(){e.getSurface(t)?e.showSurface(t):e.renderSurface(t)}))})),t.hideEvents&&t.hideEvents.forEach((function(o){n.addEventListener(o,(function(){e.hideSurface(t)}))})))},t.prototype.showSurface=function(t){return it(this,void 0,void 0,(function(){var e,n,o,i=this;return rt(this,(function(r){switch(r.label){case 0:return(e=this.getSurface(t))?[3,2]:[4,this.renderSurface(t)];case 1:r.sent(),r.label=2;case 2:return n=this.getTrigger(t),o=this.getArrow(t),e&&n?(e.classList.remove("hidden"),((t,e,n)=>{const o=new Map,i={platform:et,...n},r={...i.platform,_c:o};return(async(t,e,n)=>{const{placement:o="bottom",strategy:i="absolute",middleware:r=[],platform:l}=n,c=r.filter(Boolean),s=await(null==l.isRTL?void 0:l.isRTL(e));let a=await l.getElementRects({reference:t,floating:e,strategy:i}),{x:f,y:u}=b(a,o,s),d=o,h={},p=0;for(let n=0;n<c.length;n++){const{name:r,fn:m}=c[n],{x:g,y,data:w,reset:v}=await m({x:f,y:u,initialPlacement:o,placement:d,strategy:i,middlewareData:h,rects:a,platform:l,elements:{reference:t,floating:e}});f=null!=g?g:f,u=null!=y?y:u,h={...h,[r]:{...h[r],...w}},v&&p<=50&&(p++,"object"==typeof v&&(v.placement&&(d=v.placement),v.rects&&(a=!0===v.rects?await l.getElementRects({reference:t,floating:e,strategy:i}):v.rects),({x:f,y:u}=b(a,d,s))),n=-1)}return{x:f,y:u,placement:d,strategy:i,middlewareData:h}})(t,e,{...i,platform:r})})(n,e,{placement:t.placement,middleware:[(void 0===l&&(l={}),{name:"flip",options:l,async fn(t){var e,n;const{placement:o,middlewareData:i,rects:r,initialPlacement:c,platform:s,elements:a}=t,{mainAxis:h=!0,crossAxis:m=!0,fallbackPlacements:v,fallbackStrategy:x="bestFit",fallbackAxisSideDirection:b="none",flipAlignment:E=!0,...L}=f(l,t);if(null!=(e=i.arrow)&&e.alignmentOffset)return{};const R=u(o),T=u(c)===c,O=await(null==s.isRTL?void 0:s.isRTL(a.floating)),A=v||(T||!E?[w(c)]:function(t){const e=w(t);return[y(t),e,y(e)]}(c));v||"none"===b||A.push(...function(t,e,n,o){const i=d(t);let r=function(t,e,n){const o=["left","right"],i=["right","left"],r=["top","bottom"],l=["bottom","top"];switch(t){case"top":case"bottom":return n?e?i:o:e?o:i;case"left":case"right":return e?r:l;default:return[]}}(u(t),"start"===n,o);return i&&(r=r.map((t=>t+"-"+i)),e&&(r=r.concat(r.map(y)))),r}(c,E,b,O));const k=[c,...A],_=await S(t,L),C=[];let D=(null==(n=i.flip)?void 0:n.overflows)||[];if(h&&C.push(_[R]),m){const t=function(t,e,n){void 0===n&&(n=!1);const o=d(t),i=g(t),r=p(i);let l="x"===i?o===(n?"end":"start")?"right":"left":"start"===o?"bottom":"top";return e.reference[r]>e.floating[r]&&(l=w(l)),[l,w(l)]}(o,r,O);C.push(_[t[0]],_[t[1]])}if(D=[...D,{placement:o,overflows:C}],!C.every((t=>t<=0))){var P,H;const t=((null==(P=i.flip)?void 0:P.index)||0)+1,e=k[t];if(e)return{data:{index:t,overflows:D},reset:{placement:e}};let n=null==(H=D.filter((t=>t.overflows[0]<=0)).sort(((t,e)=>t.overflows[1]-e.overflows[1]))[0])?void 0:H.placement;if(!n)switch(x){case"bestFit":{var B;const t=null==(B=D.map((t=>[t.placement,t.overflows.filter((t=>t>0)).reduce(((t,e)=>t+e),0)])).sort(((t,e)=>t[1]-e[1]))[0])?void 0:B[0];t&&(n=t);break}case"initialPlacement":n=c}if(o!==n)return{reset:{placement:n}}}return{}}}),nt({padding:5}),E(t.offsetOptions),ot({element:o})]}).then((function(n){var r,l=n.x,c=n.y,s=n.placement,a=n.middlewareData;Object.assign(e.style,{left:"".concat(l,"px"),top:"".concat(c,"px")});var f=a.arrow,u=f.x,d=f.y,h={top:"bottom",right:"left",bottom:"top",left:"right"}[s.split("-")[0]];o&&Object.assign(o.style,((r={left:null!=u?"".concat(u,"px"):"",top:null!=d?"".concat(d,"px"):"",right:"",bottom:""})[h]="-4px",r)),e.classList.contains("show")||e.classList.add("show"),document.addEventListener("click",i.onDocumentClicked.bind(i,t),{once:!0})})),[2]):[2]}var l}))}))},t.prototype.renderSurface=function(t){return it(this,void 0,void 0,(function(){return rt(this,(function(e){switch(e.label){case 0:return[4,this._dotNetRef.invokeMethodAsync("RenderSurface",t)];case 1:return e.sent(),[2]}}))}))},t.prototype.onDocumentClicked=function(t,e){var n=this.getTrigger(t),o=this.getSurface(t);n&&o&&(n.contains(e.target)||o.contains(e.target)?document.addEventListener("click",this.onDocumentClicked.bind(this,t),{once:!0}):this.hideSurface(t))},t.prototype.hideSurface=function(t){var e=this,n=this.getSurface(t);n?(n.addEventListener("transitionend",(function(o){e.doHideSurface(t,n)}),{once:!0}),n.classList.contains("show")?n.classList.remove("show"):this.doHideSurface(t,n)):this.doHideSurface(t,n)},t.prototype.doHideSurface=function(t,e){null==e||e.classList.add("hidden"),this._dotNetRef.invokeMethodAsync("HideSurface",t)},t.prototype.getTrigger=function(t){return document.querySelector("#".concat(t.triggerId))},t.prototype.getSurface=function(t){return document.querySelector(this.getSurafeSelector(t))},t.prototype.getArrow=function(t){return document.querySelector("".concat(this.getSurafeSelector(t),">.arrow"))},t.prototype.getSurafeSelector=function(t){return"#".concat(t.triggerId,"_surface")},t.create=function(e){return new t(e)},t}(),ct=function(){function t(){}return t.setThemeMode=function(t){document.documentElement.setAttribute("data-bui-theme",t)},t.getThemeMode=function(){var t=document.documentElement.getAttribute("data-bui-theme");return null!=t?t:"light"},t.setDir=function(t){document.documentElement.setAttribute("dir",t)},t.getDir=function(){var t=document.documentElement.getAttribute("dir");return null!=t?t:"ltr"},t.setTheme=function(t){var e=document.head.querySelector('link[href*="bluent.ui.theme"]'),n=null==e?void 0:e.href;if(n&&n.includes("bluent.ui.theme")){var o=n.split("/"),i=o[o.length-1];n=n.replace(i,"bluent.ui.theme.".concat(t,".min.css"))}e.href=n},t}(),st=e.nE,at=e.AM,ft=e.Sx;export{st as Overflow,at as Popover,ft as Theme};
//# sourceMappingURL=bluent.ui.js.map