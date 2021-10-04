import { unshim, domShimSymbol } from 'https://cdn.spooky.click/dom-shim/1.3.2/mod.js?global&props=customElements,document,window,Document,Element,HTMLElement,HTMLTemplateElement,Node,requestAnimationFrame,Text';
import { isLit, shimLit } from './shim-lit.js';
import { isStencil, shimStencil } from './shim-stencil.js';

const { document } = self[domShimSymbol];

const window = document.defaultView;
const DOMParser = window.DOMParser;

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

const customElementsDefine = window.customElements.define;
function overrideElementShim(name, Ctr) {
  if(isLit(Ctr)) {
    shimLit(Ctr);
  } else if(isStencil(Ctr)) {
    shimStencil(name, Ctr);
  }
  return customElementsDefine.apply(this, arguments);
}

Object.defineProperty(window.customElements, 'define', {
  value: overrideElementShim
});

const url = new URL(import.meta.url);
if(!url.searchParams.has('global')) {
  unshim();
}

export {
  unshim
};