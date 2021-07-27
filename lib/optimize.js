import { EndOfHead } from './end-of-head.js';

export class Optimizer {
  constructor(opts) {
    this.document = opts.document;
    this.customElements = this.document.defaultView.customElements;
    this.polyfillURL = opts.polyfillURL;
  }

  optimize(frag) {
    let document = this.document;
    let customElements = this.customElements;

    let foundShadow = true;
    let eoh = new EndOfHead();
    let walker = document.createTreeWalker(frag, 133, null, false);
    let currentNode = frag;
    loop: while(currentNode) {
      switch(currentNode.nodeType) {
        case 1: {
          let name = currentNode.localName;
          eoh.visit(currentNode);

          if(customElements.get(name) && currentNode.shadowRoot) {
            foundShadow = true;
            break loop;
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