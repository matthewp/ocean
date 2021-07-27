import { elementsBeforeBody } from './shared.js';

export class EndOfHead {
  constructor() {
    this.head = null;
    this.firstNonHead = null;
  }

  get found() {
    return !!(this.head || this.firstNonHead);
  }

  find(root) {
    let doc = root.ownerDocument;
    let walker = doc.createTreeWalker(frag, 133, null, false);
    let currentNode = root;
    while(currentNode) {
      if(this.visit(node)) {
        break;
      }
      currentNode = walker.nextNode();
    }
  }

  visit(node) {
    if(this.found || node.nodeType !== 1) {
      return;
    }
    let name = node.localName;
    if(node.localName === 'head') {
      this.head = node;
      return true;
    }
    if(!elementsBeforeBody.has(name)) {
      this.firstNonHead = node;
      return true;
    }
    return false;
  }

  // Inject a node at the end of the head element
  append(node) {
    if(this.head) {
      this.head.insertBefore(node, this.head.lastChild);
    } else {
      throw new Error('Documents without a head is not currently supported');
    }
  }
}