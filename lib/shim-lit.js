import { LitElementRenderer } from 'https://cdn.spooky.click/lit-labs-ssr-bundle/1.0.1/mod.js';

const root = self[Symbol.for('dom-shim.defaultView')];
const { customElements } = root;
const customElementsDefine = customElements.define;

function * litRender() {
  const instance = new LitElementRenderer(this.localName);

  // LitElementRenderer creates a new element instance, so copy over.
  for(let attr of this.attributes) {
    instance.setAttribute(attr.name, attr.value);
  }

  yield `<${this.localName}`;
  yield* instance.renderAttributes();
  yield `>`;
  const shadowContents = instance.renderShadow({});
  if (shadowContents !== undefined) {
    yield '<template shadowroot="open">';
    yield* shadowContents;
    yield '</template>';
  }
  yield this.innerHTML;
  yield `</${this.localName}>`;
}

function overrideLitElementShim(name, Ctr) {
  if(Ctr._$litElement$) {
    Ctr.prototype.connectedCallback = Function.prototype;
    Ctr.prototype[Symbol.for('ocean.serialize')] = litRender;
  }
  return customElementsDefine.apply(this, arguments);
}

Object.defineProperty(customElements, 'define', {
  value: overrideLitElementShim
});