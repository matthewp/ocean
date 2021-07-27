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
    if(foundShadow && this.polyfillURL) {
      let script = document.createElement('script');
      script.textContent = this.inlinePolyfill();
      eoh.append(script);
    }
  }
  inlinePolyfill() {
    return /* js */ `async function polyfill() {
  const { hydrateShadowRoots } = await import('${this.polyfillURL}');
  hydrateShadowRoots(document.body);
}

const polyfillCheckEl = new DOMParser().parseFromString('<p><template shadowroot="open"></template></p>', 'text/html', { includeShadowRoots: true }).querySelector('p');

if (!polyfillCheckEl || !polyfillCheckEl.shadowRoot) {
  polyfill();
}`;
  }
}