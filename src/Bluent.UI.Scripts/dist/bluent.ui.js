var t={d:(e,n)=>{for(var o in n)t.o(n,o)&&!t.o(e,o)&&Object.defineProperty(e,o,{enumerable:!0,get:n[o]})},o:(t,e)=>Object.prototype.hasOwnProperty.call(t,e)},e={};t.d(e,{RM:()=>i,nE:()=>c,AM:()=>ut,Sx:()=>ft});var n=function(){function t(t){this._chunks=[],this._state="inactive",this._format=t}return Object.defineProperty(t.prototype,"state",{get:function(){return this._state},enumerable:!1,configurable:!0}),Object.defineProperty(t.prototype,"data",{get:function(){return new Blob(this._chunks,{type:this._format})},enumerable:!1,configurable:!0}),t.prototype.isSupported=function(){return!(!navigator.mediaDevices||!navigator.mediaDevices.getUserMedia)},t.prototype.start=function(){return t=this,e=void 0,o=function(){var t;return function(t,e){var n,o,r,i,c={label:0,sent:function(){if(1&r[0])throw r[1];return r[1]},trys:[],ops:[]};return i={next:s(0),throw:s(1),return:s(2)},"function"==typeof Symbol&&(i[Symbol.iterator]=function(){return this}),i;function s(s){return function(a){return function(s){if(n)throw new TypeError("Generator is already executing.");for(;i&&(i=0,s[0]&&(c=0)),c;)try{if(n=1,o&&(r=2&s[0]?o.return:s[0]?o.throw||((r=o.return)&&r.call(o),0):o.next)&&!(r=r.call(o,s[1])).done)return r;switch(o=0,r&&(s=[2&s[0],r.value]),s[0]){case 0:case 1:r=s;break;case 4:return c.label++,{value:s[1],done:!1};case 5:c.label++,o=s[1],s=[0];continue;case 7:s=c.ops.pop(),c.trys.pop();continue;default:if(!((r=(r=c.trys).length>0&&r[r.length-1])||6!==s[0]&&2!==s[0])){c=0;continue}if(3===s[0]&&(!r||s[1]>r[0]&&s[1]<r[3])){c.label=s[1];break}if(6===s[0]&&c.label<r[1]){c.label=r[1],r=s;break}if(r&&c.label<r[2]){c.label=r[2],c.ops.push(s);break}r[2]&&c.ops.pop(),c.trys.pop();continue}s=e.call(t,c)}catch(t){s=[6,t],o=0}finally{n=r=0}if(5&s[0])throw s[1];return{value:s[0]?s[1]:void 0,done:!0}}([s,a])}}}(this,(function(e){switch(e.label){case 0:return e.trys.push([0,2,,3]),t=this,[4,navigator.mediaDevices.getUserMedia({audio:!0})];case 1:return t._stream=e.sent(),this._mediaRecorder=new MediaRecorder(this._stream),this._mediaRecorder.ondataavailable=this.onDataAvailable.bind(this),this._mediaRecorder.onstart=this.onStart.bind(this),this._mediaRecorder.onstop=this.onStop.bind(this),this._mediaRecorder.start(),[2,!0];case 2:return e.sent(),[2,!1];case 3:return[2]}}))},new((n=void 0)||(n=Promise))((function(r,i){function c(t){try{a(o.next(t))}catch(t){i(t)}}function s(t){try{a(o.throw(t))}catch(t){i(t)}}function a(t){var e;t.done?r(t.value):(e=t.value,e instanceof n?e:new n((function(t){t(e)}))).then(c,s)}a((o=o.apply(t,e||[])).next())}));var t,e,n,o},t.prototype.stop=function(){this._mediaRecorder.stop(),this._stream.getTracks().forEach((function(t){return t.stop()}))},t.prototype.onStart=function(){this._chunks=[],this._state=this._mediaRecorder.state},t.prototype.onStop=function(){this._state=this._mediaRecorder.state,this.onStopped(this.data)},t.prototype.onDataAvailable=function(t){this._chunks.push(t.data)},t}(),o=function(t,e,n,o){return new(n||(n=Promise))((function(r,i){function c(t){try{a(o.next(t))}catch(t){i(t)}}function s(t){try{a(o.throw(t))}catch(t){i(t)}}function a(t){var e;t.done?r(t.value):(e=t.value,e instanceof n?e:new n((function(t){t(e)}))).then(c,s)}a((o=o.apply(t,e||[])).next())}))},r=function(t,e){var n,o,r,i,c={label:0,sent:function(){if(1&r[0])throw r[1];return r[1]},trys:[],ops:[]};return i={next:s(0),throw:s(1),return:s(2)},"function"==typeof Symbol&&(i[Symbol.iterator]=function(){return this}),i;function s(s){return function(a){return function(s){if(n)throw new TypeError("Generator is already executing.");for(;i&&(i=0,s[0]&&(c=0)),c;)try{if(n=1,o&&(r=2&s[0]?o.return:s[0]?o.throw||((r=o.return)&&r.call(o),0):o.next)&&!(r=r.call(o,s[1])).done)return r;switch(o=0,r&&(s=[2&s[0],r.value]),s[0]){case 0:case 1:r=s;break;case 4:return c.label++,{value:s[1],done:!1};case 5:c.label++,o=s[1],s=[0];continue;case 7:s=c.ops.pop(),c.trys.pop();continue;default:if(!((r=(r=c.trys).length>0&&r[r.length-1])||6!==s[0]&&2!==s[0])){c=0;continue}if(3===s[0]&&(!r||s[1]>r[0]&&s[1]<r[3])){c.label=s[1];break}if(6===s[0]&&c.label<r[1]){c.label=r[1],r=s;break}if(r&&c.label<r[2]){c.label=r[2],c.ops.push(s);break}r[2]&&c.ops.pop(),c.trys.pop();continue}s=e.call(t,c)}catch(t){s=[6,t],o=0}finally{n=r=0}if(5&s[0])throw s[1];return{value:s[0]?s[1]:void 0,done:!0}}([s,a])}}},i=function(){function t(t,e,o){this._dotNetRef=t,this._id=e,this._format=o,this._recorder=new n(o),this._recorder.onStopped=this.onStopped.bind(this)}return t.prototype.isSupported=function(){return this._recorder.isSupported()},t.prototype.record=function(){return o(this,void 0,void 0,(function(){return r(this,(function(t){switch(t.label){case 0:return this.emptyPlayList(),[4,this._recorder.start()];case 1:return[2,t.sent()]}}))}))},t.prototype.stop=function(){"recording"==this._recorder.state&&this._recorder.stop()},t.prototype.onStopped=function(t){return o(this,void 0,void 0,(function(){var e,n;return r(this,(function(o){switch(o.label){case 0:return n=Uint8Array.bind,[4,t.arrayBuffer()];case 1:return e=new(n.apply(Uint8Array,[void 0,o.sent()])),[4,this._dotNetRef.invokeMethodAsync("OnAudioCaptured",e)];case 2:return o.sent(),this.generateAudioElement(e),[2]}}))}))},t.prototype.generateAudioElement=function(t){var e=this.getPlayList();if(e){this.emptyPlayList();var n=document.createElement("audio");n.setAttribute("controls",""),e.appendChild(n);var o=new Blob([t.buffer],{type:this._format}),r=window.URL.createObjectURL(o);n.src=r}},t.prototype.emptyPlayList=function(){var t=this.getPlayList();t&&t.replaceChildren()},t.prototype.getPlayList=function(){return document.querySelector("#".concat(this._id,">.play-list"))},t.create=function(e,n,o){return new t(e,n,o)},t}(),c=function(){function t(){}return t.prototype.init=function(t){if(this._element=document.getElementById(t),this._element){var e=this._element.querySelector(":scope > .overflow-button");this._overflowSurface=document.querySelector("#".concat(e.id,"_surface>.overflow-menu")),this._overflowMenu=document.querySelector("#".concat(e.id,"_surface>.overflow-menu")),this._isHorizontal=this._element.classList.contains("horizontal"),this.getOverflowButtonDimention(e),new ResizeObserver(this.onSizeChanged.bind(this)).observe(this._element),this._mutaionObserver=new MutationObserver(this.onSurfaceContentChanged.bind(this))}this.checkOverflow()},t.prototype.checkOverflow=function(){try{this.disconnectMutionObserver();var t=Array.from(this._element.children).filter((function(t){return!t.classList.contains("overflow-button")})),e=Array.from(this._overflowMenu.children);this.clearOverflowingItems(t),this.clearOverflowingItems(e);var n=this.getFirstOverflowIndex(t);this.setOverflowingItems(n,t),this.setOverflowingItems(n,e)}catch(t){}finally{this.connectMutationObserver()}},t.prototype.getOverflowButtonDimention=function(t){t.style.display="inline-flex",this._overflowButtonWidth=t.clientWidth,this._overflowButtonHeight=t.clientHeight,t.style.display=""},t.prototype.setOverflowingItems=function(t,e){if(-1!=t)for(var n=t;n<e.length;n++)e[n].classList.add("overflowing")},t.prototype.getFirstOverflowIndex=function(t){if(this._isHorizontal)for(var e=parseInt(window.getComputedStyle(this._element,null).getPropertyValue("padding-inline-start")),n=parseInt(window.getComputedStyle(this._element,null).getPropertyValue("padding-inline-end")),o=this._element.clientWidth-e-n,r=0;r<t.length;r++){var i=t[r];if(this.getOffsetEnd(i)-e+this._overflowButtonWidth>o)return r}else{var c=parseInt(window.getComputedStyle(this._element,null).getPropertyValue("padding-top")),s=parseInt(window.getComputedStyle(this._element,null).getPropertyValue("padding-bottom")),a=this._element.clientHeight-c-s;for(r=0;r<t.length;r++)if((i=t[r]).offsetTop+i.offsetHeight-c+this._overflowButtonHeight>a)return r}return-1},t.prototype.clearOverflowingItems=function(t){t.forEach((function(t){return t.classList.remove("overflowing")}))},t.prototype.getOffsetEnd=function(t){var e=window.getComputedStyle(t.parentElement).getPropertyValue("direction"),n=t.parentElement.getBoundingClientRect(),o=t.getBoundingClientRect();return"ltr"===e?o.left-n.left+o.width:n.right-o.right+o.width},t.prototype.onSizeChanged=function(){this.checkOverflow()},t.prototype.onSurfaceContentChanged=function(){this.checkOverflow()},t.prototype.disconnectMutionObserver=function(){this._mutaionObserver&&this._mutaionObserver.disconnect()},t.prototype.connectMutationObserver=function(){this._mutaionObserver.observe(this._overflowSurface,{attributes:!0,childList:!0,subtree:!0})},t.create=function(){return new t},t}();const s=Math.min,a=Math.max,l=Math.round,u=(Math.floor,t=>({x:t,y:t})),f={left:"right",right:"left",bottom:"top",top:"bottom"},d={start:"end",end:"start"};function h(t,e,n){return a(t,s(e,n))}function p(t,e){return"function"==typeof t?t(e):t}function m(t){return t.split("-")[0]}function y(t){return t.split("-")[1]}function g(t){return"x"===t?"y":"x"}function v(t){return"y"===t?"height":"width"}function w(t){return["top","bottom"].includes(m(t))?"y":"x"}function b(t){return g(w(t))}function x(t){return t.replace(/start|end/g,(t=>d[t]))}function S(t){return t.replace(/left|right|bottom|top/g,(t=>f[t]))}function _(t){return"number"!=typeof t?function(t){return{top:0,right:0,bottom:0,left:0,...t}}(t):{top:t,right:t,bottom:t,left:t}}function E(t){return{...t,top:t.y,left:t.x,right:t.x+t.width,bottom:t.y+t.height}}function O(t,e,n){let{reference:o,floating:r}=t;const i=w(e),c=b(e),s=v(c),a=m(e),l="y"===i,u=o.x+o.width/2-r.width/2,f=o.y+o.height/2-r.height/2,d=o[s]/2-r[s]/2;let h;switch(a){case"top":h={x:u,y:o.y-r.height};break;case"bottom":h={x:u,y:o.y+o.height};break;case"right":h={x:o.x+o.width,y:f};break;case"left":h={x:o.x-r.width,y:f};break;default:h={x:o.x,y:o.y}}switch(y(e)){case"start":h[c]-=d*(n&&l?-1:1);break;case"end":h[c]+=d*(n&&l?-1:1)}return h}async function R(t,e){var n;void 0===e&&(e={});const{x:o,y:r,platform:i,rects:c,elements:s,strategy:a}=t,{boundary:l="clippingAncestors",rootBoundary:u="viewport",elementContext:f="floating",altBoundary:d=!1,padding:h=0}=p(e,t),m=_(h),y=s[d?"floating"===f?"reference":"floating":f],g=E(await i.getClippingRect({element:null==(n=await(null==i.isElement?void 0:i.isElement(y)))||n?y:y.contextElement||await(null==i.getDocumentElement?void 0:i.getDocumentElement(s.floating)),boundary:l,rootBoundary:u,strategy:a})),v="floating"===f?{...c.floating,x:o,y:r}:c.reference,w=await(null==i.getOffsetParent?void 0:i.getOffsetParent(s.floating)),b=await(null==i.isElement?void 0:i.isElement(w))&&await(null==i.getScale?void 0:i.getScale(w))||{x:1,y:1},x=E(i.convertOffsetParentRelativeRectToViewportRelativeRect?await i.convertOffsetParentRelativeRectToViewportRelativeRect({elements:s,rect:v,offsetParent:w,strategy:a}):v);return{top:(g.top-x.top+m.top)/b.y,bottom:(x.bottom-g.bottom+m.bottom)/b.y,left:(g.left-x.left+m.left)/b.x,right:(x.right-g.right+m.right)/b.x}}const L=function(t){return void 0===t&&(t=0),{name:"offset",options:t,async fn(e){var n,o;const{x:r,y:i,placement:c,middlewareData:s}=e,a=await async function(t,e){const{placement:n,platform:o,elements:r}=t,i=await(null==o.isRTL?void 0:o.isRTL(r.floating)),c=m(n),s=y(n),a="y"===w(n),l=["left","top"].includes(c)?-1:1,u=i&&a?-1:1,f=p(e,t);let{mainAxis:d,crossAxis:h,alignmentAxis:g}="number"==typeof f?{mainAxis:f,crossAxis:0,alignmentAxis:null}:{mainAxis:0,crossAxis:0,alignmentAxis:null,...f};return s&&"number"==typeof g&&(h="end"===s?-1*g:g),a?{x:h*u,y:d*l}:{x:d*l,y:h*u}}(e,t);return c===(null==(n=s.offset)?void 0:n.placement)&&null!=(o=s.arrow)&&o.alignmentOffset?{}:{x:r+a.x,y:i+a.y,data:{...a,placement:c}}}}};function k(t){return P(t)?(t.nodeName||"").toLowerCase():"#document"}function T(t){var e;return(null==t||null==(e=t.ownerDocument)?void 0:e.defaultView)||window}function A(t){var e;return null==(e=(P(t)?t.ownerDocument:t.document)||window.document)?void 0:e.documentElement}function P(t){return t instanceof Node||t instanceof T(t).Node}function C(t){return t instanceof Element||t instanceof T(t).Element}function D(t){return t instanceof HTMLElement||t instanceof T(t).HTMLElement}function M(t){return"undefined"!=typeof ShadowRoot&&(t instanceof ShadowRoot||t instanceof T(t).ShadowRoot)}function H(t){const{overflow:e,overflowX:n,overflowY:o,display:r}=F(t);return/auto|scroll|overlay|hidden|clip/.test(e+o+n)&&!["inline","contents"].includes(r)}function B(t){return["table","td","th"].includes(k(t))}function I(t){const e=V(),n=F(t);return"none"!==n.transform||"none"!==n.perspective||!!n.containerType&&"normal"!==n.containerType||!e&&!!n.backdropFilter&&"none"!==n.backdropFilter||!e&&!!n.filter&&"none"!==n.filter||["transform","perspective","filter"].some((t=>(n.willChange||"").includes(t)))||["paint","layout","strict","content"].some((t=>(n.contain||"").includes(t)))}function V(){return!("undefined"==typeof CSS||!CSS.supports)&&CSS.supports("-webkit-backdrop-filter","none")}function W(t){return["html","body","#document"].includes(k(t))}function F(t){return T(t).getComputedStyle(t)}function N(t){return C(t)?{scrollLeft:t.scrollLeft,scrollTop:t.scrollTop}:{scrollLeft:t.pageXOffset,scrollTop:t.pageYOffset}}function z(t){if("html"===k(t))return t;const e=t.assignedSlot||t.parentNode||M(t)&&t.host||A(t);return M(e)?e.host:e}function j(t){const e=z(t);return W(e)?t.ownerDocument?t.ownerDocument.body:t.body:D(e)&&H(e)?e:j(e)}function q(t,e,n){var o;void 0===e&&(e=[]),void 0===n&&(n=!0);const r=j(t),i=r===(null==(o=t.ownerDocument)?void 0:o.body),c=T(r);return i?e.concat(c,c.visualViewport||[],H(r)?r:[],c.frameElement&&n?q(c.frameElement):[]):e.concat(r,q(r,[],n))}function U(t){const e=F(t);let n=parseFloat(e.width)||0,o=parseFloat(e.height)||0;const r=D(t),i=r?t.offsetWidth:n,c=r?t.offsetHeight:o,s=l(n)!==i||l(o)!==c;return s&&(n=i,o=c),{width:n,height:o,$:s}}function G(t){return C(t)?t:t.contextElement}function X(t){const e=G(t);if(!D(e))return u(1);const n=e.getBoundingClientRect(),{width:o,height:r,$:i}=U(e);let c=(i?l(n.width):n.width)/o,s=(i?l(n.height):n.height)/r;return c&&Number.isFinite(c)||(c=1),s&&Number.isFinite(s)||(s=1),{x:c,y:s}}const Y=u(0);function $(t){const e=T(t);return V()&&e.visualViewport?{x:e.visualViewport.offsetLeft,y:e.visualViewport.offsetTop}:Y}function J(t,e,n,o){void 0===e&&(e=!1),void 0===n&&(n=!1);const r=t.getBoundingClientRect(),i=G(t);let c=u(1);e&&(o?C(o)&&(c=X(o)):c=X(t));const s=function(t,e,n){return void 0===e&&(e=!1),!(!n||e&&n!==T(t))&&e}(i,n,o)?$(i):u(0);let a=(r.left+s.x)/c.x,l=(r.top+s.y)/c.y,f=r.width/c.x,d=r.height/c.y;if(i){const t=T(i),e=o&&C(o)?T(o):o;let n=t,r=n.frameElement;for(;r&&o&&e!==n;){const t=X(r),e=r.getBoundingClientRect(),o=F(r),i=e.left+(r.clientLeft+parseFloat(o.paddingLeft))*t.x,c=e.top+(r.clientTop+parseFloat(o.paddingTop))*t.y;a*=t.x,l*=t.y,f*=t.x,d*=t.y,a+=i,l+=c,n=T(r),r=n.frameElement}}return E({width:f,height:d,x:a,y:l})}const K=[":popover-open",":modal"];function Q(t){return K.some((e=>{try{return t.matches(e)}catch(t){return!1}}))}function Z(t){return J(A(t)).left+N(t).scrollLeft}function tt(t,e,n){let o;if("viewport"===e)o=function(t,e){const n=T(t),o=A(t),r=n.visualViewport;let i=o.clientWidth,c=o.clientHeight,s=0,a=0;if(r){i=r.width,c=r.height;const t=V();(!t||t&&"fixed"===e)&&(s=r.offsetLeft,a=r.offsetTop)}return{width:i,height:c,x:s,y:a}}(t,n);else if("document"===e)o=function(t){const e=A(t),n=N(t),o=t.ownerDocument.body,r=a(e.scrollWidth,e.clientWidth,o.scrollWidth,o.clientWidth),i=a(e.scrollHeight,e.clientHeight,o.scrollHeight,o.clientHeight);let c=-n.scrollLeft+Z(t);const s=-n.scrollTop;return"rtl"===F(o).direction&&(c+=a(e.clientWidth,o.clientWidth)-r),{width:r,height:i,x:c,y:s}}(A(t));else if(C(e))o=function(t,e){const n=J(t,!0,"fixed"===e),o=n.top+t.clientTop,r=n.left+t.clientLeft,i=D(t)?X(t):u(1);return{width:t.clientWidth*i.x,height:t.clientHeight*i.y,x:r*i.x,y:o*i.y}}(e,n);else{const n=$(t);o={...e,x:e.x-n.x,y:e.y-n.y}}return E(o)}function et(t,e){const n=z(t);return!(n===e||!C(n)||W(n))&&("fixed"===F(n).position||et(n,e))}function nt(t,e,n){const o=D(e),r=A(e),i="fixed"===n,c=J(t,!0,i,e);let s={scrollLeft:0,scrollTop:0};const a=u(0);if(o||!o&&!i)if(("body"!==k(e)||H(r))&&(s=N(e)),o){const t=J(e,!0,i,e);a.x=t.x+e.clientLeft,a.y=t.y+e.clientTop}else r&&(a.x=Z(r));return{x:c.left+s.scrollLeft-a.x,y:c.top+s.scrollTop-a.y,width:c.width,height:c.height}}function ot(t,e){return D(t)&&"fixed"!==F(t).position?e?e(t):t.offsetParent:null}function rt(t,e){const n=T(t);if(!D(t)||Q(t))return n;let o=ot(t,e);for(;o&&B(o)&&"static"===F(o).position;)o=ot(o,e);return o&&("html"===k(o)||"body"===k(o)&&"static"===F(o).position&&!I(o))?n:o||function(t){let e=z(t);for(;D(e)&&!W(e);){if(I(e))return e;e=z(e)}return null}(t)||n}const it={convertOffsetParentRelativeRectToViewportRelativeRect:function(t){let{elements:e,rect:n,offsetParent:o,strategy:r}=t;const i="fixed"===r,c=A(o),s=!!e&&Q(e.floating);if(o===c||s&&i)return n;let a={scrollLeft:0,scrollTop:0},l=u(1);const f=u(0),d=D(o);if((d||!d&&!i)&&(("body"!==k(o)||H(c))&&(a=N(o)),D(o))){const t=J(o);l=X(o),f.x=t.x+o.clientLeft,f.y=t.y+o.clientTop}return{width:n.width*l.x,height:n.height*l.y,x:n.x*l.x-a.scrollLeft*l.x+f.x,y:n.y*l.y-a.scrollTop*l.y+f.y}},getDocumentElement:A,getClippingRect:function(t){let{element:e,boundary:n,rootBoundary:o,strategy:r}=t;const i=[..."clippingAncestors"===n?function(t,e){const n=e.get(t);if(n)return n;let o=q(t,[],!1).filter((t=>C(t)&&"body"!==k(t))),r=null;const i="fixed"===F(t).position;let c=i?z(t):t;for(;C(c)&&!W(c);){const e=F(c),n=I(c);n||"fixed"!==e.position||(r=null),(i?!n&&!r:!n&&"static"===e.position&&r&&["absolute","fixed"].includes(r.position)||H(c)&&!n&&et(t,c))?o=o.filter((t=>t!==c)):r=e,c=z(c)}return e.set(t,o),o}(e,this._c):[].concat(n),o],c=i[0],l=i.reduce(((t,n)=>{const o=tt(e,n,r);return t.top=a(o.top,t.top),t.right=s(o.right,t.right),t.bottom=s(o.bottom,t.bottom),t.left=a(o.left,t.left),t}),tt(e,c,r));return{width:l.right-l.left,height:l.bottom-l.top,x:l.left,y:l.top}},getOffsetParent:rt,getElementRects:async function(t){const e=this.getOffsetParent||rt,n=this.getDimensions;return{reference:nt(t.reference,await e(t.floating),t.strategy),floating:{x:0,y:0,...await n(t.floating)}}},getClientRects:function(t){return Array.from(t.getClientRects())},getDimensions:function(t){const{width:e,height:n}=U(t);return{width:e,height:n}},getScale:X,isElement:C,isRTL:function(t){return"rtl"===F(t).direction}},ct=function(t){return void 0===t&&(t={}),{name:"shift",options:t,async fn(e){const{x:n,y:o,placement:r}=e,{mainAxis:i=!0,crossAxis:c=!1,limiter:s={fn:t=>{let{x:e,y:n}=t;return{x:e,y:n}}},...a}=p(t,e),l={x:n,y:o},u=await R(e,a),f=w(m(r)),d=g(f);let y=l[d],v=l[f];if(i){const t="y"===d?"bottom":"right";y=h(y+u["y"===d?"top":"left"],y,y-u[t])}if(c){const t="y"===f?"bottom":"right";v=h(v+u["y"===f?"top":"left"],v,v-u[t])}const b=s.fn({...e,[d]:y,[f]:v});return{...b,data:{x:b.x-n,y:b.y-o}}}}},st=t=>({name:"arrow",options:t,async fn(e){const{x:n,y:o,placement:r,rects:i,platform:c,elements:a,middlewareData:l}=e,{element:u,padding:f=0}=p(t,e)||{};if(null==u)return{};const d=_(f),m={x:n,y:o},g=b(r),w=v(g),x=await c.getDimensions(u),S="y"===g,E=S?"top":"left",O=S?"bottom":"right",R=S?"clientHeight":"clientWidth",L=i.reference[w]+i.reference[g]-m[g]-i.floating[w],k=m[g]-i.reference[g],T=await(null==c.getOffsetParent?void 0:c.getOffsetParent(u));let A=T?T[R]:0;A&&await(null==c.isElement?void 0:c.isElement(T))||(A=a.floating[R]||i.floating[w]);const P=L/2-k/2,C=A/2-x[w]/2-1,D=s(d[E],C),M=s(d[O],C),H=D,B=A-x[w]-M,I=A/2-x[w]/2+P,V=h(H,I,B),W=!l.arrow&&null!=y(r)&&I!==V&&i.reference[w]/2-(I<H?D:M)-x[w]/2<0,F=W?I<H?I-H:I-B:0;return{[g]:m[g]+F,data:{[g]:V,centerOffset:I-V-F,...W&&{alignmentOffset:F}},reset:W}}});var at=function(t,e,n,o){return new(n||(n=Promise))((function(r,i){function c(t){try{a(o.next(t))}catch(t){i(t)}}function s(t){try{a(o.throw(t))}catch(t){i(t)}}function a(t){var e;t.done?r(t.value):(e=t.value,e instanceof n?e:new n((function(t){t(e)}))).then(c,s)}a((o=o.apply(t,e||[])).next())}))},lt=function(t,e){var n,o,r,i,c={label:0,sent:function(){if(1&r[0])throw r[1];return r[1]},trys:[],ops:[]};return i={next:s(0),throw:s(1),return:s(2)},"function"==typeof Symbol&&(i[Symbol.iterator]=function(){return this}),i;function s(s){return function(a){return function(s){if(n)throw new TypeError("Generator is already executing.");for(;i&&(i=0,s[0]&&(c=0)),c;)try{if(n=1,o&&(r=2&s[0]?o.return:s[0]?o.throw||((r=o.return)&&r.call(o),0):o.next)&&!(r=r.call(o,s[1])).done)return r;switch(o=0,r&&(s=[2&s[0],r.value]),s[0]){case 0:case 1:r=s;break;case 4:return c.label++,{value:s[1],done:!1};case 5:c.label++,o=s[1],s=[0];continue;case 7:s=c.ops.pop(),c.trys.pop();continue;default:if(!((r=(r=c.trys).length>0&&r[r.length-1])||6!==s[0]&&2!==s[0])){c=0;continue}if(3===s[0]&&(!r||s[1]>r[0]&&s[1]<r[3])){c.label=s[1];break}if(6===s[0]&&c.label<r[1]){c.label=r[1],r=s;break}if(r&&c.label<r[2]){c.label=r[2],c.ops.push(s);break}r[2]&&c.ops.pop(),c.trys.pop();continue}s=e.call(t,c)}catch(t){s=[6,t],o=0}finally{n=r=0}if(5&s[0])throw s[1];return{value:s[0]?s[1]:void 0,done:!0}}([s,a])}}},ut=function(){function t(t){this._dotNetRef=t}return t.prototype.setPopover=function(t){var e=this,n=this.getTrigger(t);n&&(t.triggerEvents&&t.triggerEvents.forEach((function(o){n.addEventListener(o,(function(){e.getSurface(t)?e.showSurface(t):e.renderSurface(t)}))})),t.hideEvents&&t.hideEvents.forEach((function(o){n.addEventListener(o,(function(){e.hideSurface(t)}))})))},t.prototype.showSurface=function(t){return at(this,void 0,void 0,(function(){var e;return lt(this,(function(n){switch(n.label){case 0:return(e=this.getSurface(t))?[3,2]:[4,this.renderSurface(t)];case 1:n.sent(),n.label=2;case 2:return e.classList.remove("hidden"),this.updatePosition(t),e.classList.contains("show")||e.classList.add("show"),document.addEventListener("click",this.onDocumentClicked.bind(this,t),{once:!0}),[2]}}))}))},t.prototype.updatePosition=function(t){var e,n=this.getSurface(t),o=this.getTrigger(t),r=this.getArrow(t);n&&o&&((t,e,n)=>{const o=new Map,r={platform:it,...n},i={...r.platform,_c:o};return(async(t,e,n)=>{const{placement:o="bottom",strategy:r="absolute",middleware:i=[],platform:c}=n,s=i.filter(Boolean),a=await(null==c.isRTL?void 0:c.isRTL(e));let l=await c.getElementRects({reference:t,floating:e,strategy:r}),{x:u,y:f}=O(l,o,a),d=o,h={},p=0;for(let n=0;n<s.length;n++){const{name:i,fn:m}=s[n],{x:y,y:g,data:v,reset:w}=await m({x:u,y:f,initialPlacement:o,placement:d,strategy:r,middlewareData:h,rects:l,platform:c,elements:{reference:t,floating:e}});u=null!=y?y:u,f=null!=g?g:f,h={...h,[i]:{...h[i],...v}},w&&p<=50&&(p++,"object"==typeof w&&(w.placement&&(d=w.placement),w.rects&&(l=!0===w.rects?await c.getElementRects({reference:t,floating:e,strategy:r}):w.rects),({x:u,y:f}=O(l,d,a))),n=-1)}return{x:u,y:f,placement:d,strategy:r,middlewareData:h}})(t,e,{...r,platform:i})})(o,n,{placement:t.placement,middleware:[(void 0===e&&(e={}),{name:"flip",options:e,async fn(t){var n,o;const{placement:r,middlewareData:i,rects:c,initialPlacement:s,platform:a,elements:l}=t,{mainAxis:u=!0,crossAxis:f=!0,fallbackPlacements:d,fallbackStrategy:h="bestFit",fallbackAxisSideDirection:g="none",flipAlignment:w=!0,..._}=p(e,t);if(null!=(n=i.arrow)&&n.alignmentOffset)return{};const E=m(r),O=m(s)===s,L=await(null==a.isRTL?void 0:a.isRTL(l.floating)),k=d||(O||!w?[S(s)]:function(t){const e=S(t);return[x(t),e,x(e)]}(s));d||"none"===g||k.push(...function(t,e,n,o){const r=y(t);let i=function(t,e,n){const o=["left","right"],r=["right","left"],i=["top","bottom"],c=["bottom","top"];switch(t){case"top":case"bottom":return n?e?r:o:e?o:r;case"left":case"right":return e?i:c;default:return[]}}(m(t),"start"===n,o);return r&&(i=i.map((t=>t+"-"+r)),e&&(i=i.concat(i.map(x)))),i}(s,w,g,L));const T=[s,...k],A=await R(t,_),P=[];let C=(null==(o=i.flip)?void 0:o.overflows)||[];if(u&&P.push(A[E]),f){const t=function(t,e,n){void 0===n&&(n=!1);const o=y(t),r=b(t),i=v(r);let c="x"===r?o===(n?"end":"start")?"right":"left":"start"===o?"bottom":"top";return e.reference[i]>e.floating[i]&&(c=S(c)),[c,S(c)]}(r,c,L);P.push(A[t[0]],A[t[1]])}if(C=[...C,{placement:r,overflows:P}],!P.every((t=>t<=0))){var D,M;const t=((null==(D=i.flip)?void 0:D.index)||0)+1,e=T[t];if(e)return{data:{index:t,overflows:C},reset:{placement:e}};let n=null==(M=C.filter((t=>t.overflows[0]<=0)).sort(((t,e)=>t.overflows[1]-e.overflows[1]))[0])?void 0:M.placement;if(!n)switch(h){case"bestFit":{var H;const t=null==(H=C.map((t=>[t.placement,t.overflows.filter((t=>t>0)).reduce(((t,e)=>t+e),0)])).sort(((t,e)=>t[1]-e[1]))[0])?void 0:H[0];t&&(n=t);break}case"initialPlacement":n=s}if(r!==n)return{reset:{placement:n}}}return{}}}),ct({padding:t.padding}),L(t.offset),st({element:r})]}).then((function(t){var e,o=t.x,i=t.y,c=t.placement,s=t.middlewareData;Object.assign(n.style,{left:"".concat(o,"px"),top:"".concat(i,"px")});var a=s.arrow,l=a.x,u=a.y,f={top:"bottom",right:"left",bottom:"top",left:"right"}[c.split("-")[0]];r&&Object.assign(r.style,((e={left:null!=l?"".concat(l,"px"):"",top:null!=u?"".concat(u,"px"):"",right:"",bottom:""})[f]="-4px",e))}))},t.prototype.renderSurface=function(t){return at(this,void 0,void 0,(function(){var e,n=this;return lt(this,(function(o){switch(o.label){case 0:return[4,this._dotNetRef.invokeMethodAsync("RenderSurface",t)];case 1:return o.sent(),(e=this.getSurface(t))&&(this._resizeObserver=new ResizeObserver((function(){n.updatePosition(t)})),this._resizeObserver.observe(e),new MutationObserver((function(t,o){t.forEach((function(t){t.removedNodes.forEach((function(t){t==e&&(n._resizeObserver.disconnect(),o.disconnect())}))}))})).observe(e.parentElement,{childList:!0})),[2]}}))}))},t.prototype.onDocumentClicked=function(t,e){var n=this.getTrigger(t),o=this.getSurface(t);n&&o&&(n.contains(e.target)||o.contains(e.target)||e.defaultPrevented?document.addEventListener("click",this.onDocumentClicked.bind(this,t),{once:!0}):this.hideSurface(t))},t.prototype.hideSurface=function(t){var e=this,n=this.getSurface(t);n?(n.addEventListener("transitionend",(function(o){e.doHideSurface(t,n)}),{once:!0}),n.classList.contains("show")?n.classList.remove("show"):this.doHideSurface(t,n)):this.doHideSurface(t,n)},t.prototype.doHideSurface=function(t,e){null==e||e.classList.add("hidden"),this._dotNetRef.invokeMethodAsync("HideSurface",t)},t.prototype.getTrigger=function(t){return document.querySelector("#".concat(t.triggerId))},t.prototype.getSurface=function(t){return document.querySelector(this.getSurafeSelector(t))},t.prototype.getArrow=function(t){return document.querySelector("".concat(this.getSurafeSelector(t),">.arrow"))},t.prototype.getSurafeSelector=function(t){return"#".concat(t.triggerId,"_surface")},t.create=function(e){return new t(e)},t}(),ft=function(){function t(){}return t.setThemeMode=function(t){document.documentElement.setAttribute("data-bui-theme",t)},t.getThemeMode=function(){var t=document.documentElement.getAttribute("data-bui-theme");return null!=t?t:"light"},t.setDir=function(t){document.documentElement.setAttribute("dir",t)},t.getDir=function(){var t=document.documentElement.getAttribute("dir");return null!=t?t:"ltr"},t.setTheme=function(t){var e=document.head.querySelector('link[href*="bluent.ui.theme"]'),n=null==e?void 0:e.href;if(n&&n.includes("bluent.ui.theme")){var o=n.split("/"),r=o[o.length-1];n=n.replace(r,"bluent.ui.theme.".concat(t,".min.css"))}e.href=n},t}(),dt=e.RM,ht=e.nE,pt=e.AM,mt=e.Sx;export{dt as AudioCapture,ht as Overflow,pt as Popover,mt as Theme};
//# sourceMappingURL=bluent.ui.js.map