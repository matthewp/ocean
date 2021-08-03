import { unshim, domShimSymbol } from 'https://cdn.spooky.click/dom-shim/1.1.1/mod.js?global&props=customElements,document,window,Document,HTMLElement,HTMLTemplateElement,Node,Text';
import './shim-lit.js';

var lastTime = 0;
globalThis.requestAnimationFrame = function(callback, element) {
  var currTime = new Date().getTime();
  var timeToCall = Math.max(0, 16 - (currTime - lastTime));
  var id = setTimeout(function() { callback(currTime + timeToCall); }, 
    timeToCall);
  lastTime = currTime + timeToCall;
  return id;
};


const { document } = self[domShimSymbol];

const window = document.defaultView;
const DOMParser = window.DOMParser;

// TODO do not check this in here.
delete window.HTMLElement.observedAttributes;
console.log("DEF", window.HTMLElement.observedAttributes)

const ShadowPrototype = document.createElement('div').attachShadow({mode:'open'}).constructor.prototype;
let _innerhtml = Symbol('ocean.innerhtmlshim');
Object.defineProperty(ShadowPrototype, 'innerHTML', {
  get() {
    return this[_innerhtml];
  },
  set(val) {
    this[_innerhtml] = val;
    let parser = new DOMParser();
    let doc = parser.parseFromString(val, 'text/html');
    this.replaceChildren(...doc.childNodes);
  }
});

const url = new URL(import.meta.url);
if(!url.searchParams.has('global')) {
  unshim();
}

export {
  unshim
};