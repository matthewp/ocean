import { EndOfHead } from './end-of-head.js';

export class Optimizer {
  constructor(opts) {
    this.document = opts.document;
    this.customElements = this.document.defaultView.customElements;
    this.elements = opts.elements;
    this.hydrator = opts.hydrator;
    this.polyfillURL = opts.polyfillURL;
  }

  async optimize(frag) {
    let document = this.document;
    let customElements = this.customElements;
    let elements = this.elements;
    let hydrator = this.hydrator.createInstance();

    let foundShadow = true;
    let eoh = new EndOfHead(document);
    let walker = document.createTreeWalker(frag, 133, null, false);
    let currentNode = frag;
    while(currentNode) {
      switch(currentNode.nodeType) {
        case 1: {
          let name = currentNode.localName;
          eoh.visit(currentNode);

          if(customElements.get(name)) {
            if(currentNode.shadowRoot) {
              foundShadow = true;
            }
            if(elements.has(name)) {
              await hydrator.handle(eoh, currentNode, elements.get(name));
            }
          }
          break;
        }
      }

      currentNode = walker.nextNode();
    }
    if(foundShadow && eoh.foundElementsBeforeBody && this.polyfillURL) {
      let script = document.createElement('script');
      script.setAttribute('type', 'module');
      script.textContent = this.inlinePolyfill();
      eoh.append(script);
    }
  }
  inlinePolyfill() {
    return /* js */ `const o=(new DOMParser).parseFromString('<p><template shadowroot="open"></template></p>',"text/html",{includeShadowRoots:!0}).querySelector("p");o&&o.shadowRoot||async function(){const{hydrateShadowRoots:o}=await import("${this.polyfillURL}");o(document.body)}()`;
  }
}