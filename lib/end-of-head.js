import { elementsBeforeBody } from './shared.js';

export class EndOfHead {
  constructor() {
    this.head = null;
    this.firstNonHead = null;
    this.foundElementsBeforeBody = false;
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
    } else {
      this.foundElementsBeforeBody = true;
    }
    return false;
  }

  // Inject a node at the end of the head element
  append(node) {
    if(this.head) {
      this.head.insertBefore(node, this.head.lastChild);
    } else if(this.firstNonHead) {
      this.firstNonHead.parentNode.insertBefore(node, this.firstNonHead);
    }
  }
}