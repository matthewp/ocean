import { unshim, domShimSymbol } from 'https://cdn.spooky.click/dom-shim/1.0.0/mod.js?global&props=HTMLElement,HTMLTemplateElement,customElements,document';
import './shim-lit.js';

const { document } = self[domShimSymbol];

const DOMParser = document.defaultView.DOMParser;

const ShadowPrototype = document.createElement('div').attachShadow({mode:'open'}).constructor.prototype;
let _innerhtml = Symbol('beach.innerhtmlshim');
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