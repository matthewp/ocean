import { serialize } from './serialize.js';
import { commentPlaceholder, prefix } from './compiler-shared.js';
import { AttributeBinding, PropertyBinding, TextBinding } from './binding.js';
import { urlRelative } from './deps.js';

const asyncRenderSymbol = Symbol.for('ocean.asyncRender');

function isPrimitive(val) {
  if (typeof val === 'object') {
    return val === null;
  }
  return typeof val !== 'function';
}

function isThenable(val) {
  return typeof val.then === 'function';
}

async function * iterable(value) {
  if(isPrimitive(value) || isThenable(value)) {
    yield (value || '');
  } else if(Array.isArray(value)) {
    for(let inner of value) {
      yield * iterable(inner);
    }
  } else {
    yield * value;
  }
}

class Part {
  constructor(start, end) {
    this.start = start;
    this.end = end;
  }
}

export class TextPart extends Part {
  constructor(text, start, end) {
    super(start, end);
    this.text = text;
  }

  addDoctype(doctype) {
    this.text = doctype.replace(this.text);
  }

  async * render(values) {
    yield this.text;
    for(let value of values) {
      yield * iterable(value);
    }
  }
}

export class ComponentPart {
  constructor(node, state) {
    let start = state.i;
    this.node = node;
    this.document = node.ownerDocument;
    this.start = start;
    this.bindings = new Map();
    this.hasBindings = false;
    this.process(node, state);
    this.end = state.i;
  }
  process(node, state) {
    let document = this.document;
    let bindings = this.bindings;
    
    let walker = document.createTreeWalker(node, 133, null, false);
    let currentNode = node;
    let index = 0;
    while(currentNode) {
      switch(currentNode.nodeType) {
        case 1: {
          let nodeBindings = [];
          for(let attr of currentNode.attributes) {
            if(attr.value === commentPlaceholder) {
              if(attr.name.startsWith('.')) {
                nodeBindings.push(new PropertyBinding(attr.name.substr(1)));
                currentNode.removeAttribute(attr.name);
              } else {
                nodeBindings.push(new AttributeBinding(attr.name));
              }
              state.i++;
              this.end++;
            }
          }
          if (nodeBindings.length) {
            bindings.set(index, nodeBindings);
          }
          break;
        }
        case 8: {
          if(currentNode.data === prefix) {
            currentNode.replaceWith(document.createTextNode(''));
            bindings.set(index, [new TextBinding()]);
            state.i++;
            this.end++;
          }
          break;
        }
      }
      index++;
      currentNode = walker.nextNode();
    }
    this.hasBindings = this.bindings.size > 0;
  }
  async hydrate(values) {
    let resolved = await Promise.all(values);
    let document = this.document;
    let el = this.node.cloneNode(true);

    if(this.hasBindings) {
      let bindings = this.bindings;
      let walker = document.createTreeWalker(el, -1);
      let currentNode = el;
      let index = 0;
      let valueIndex = 0;
  
      while(currentNode) {
        if(bindings.has(index)) {
          for (let binding of bindings.get(index)) {
            let value = resolved[valueIndex];
            binding.set(currentNode, value);
            valueIndex++;
          }
        }
        index++;
        currentNode = walker.nextNode();
      }
    }

    return el;
  }
  async * render(values) {
    let el = await this.hydrate(values);
    let document = this.document;
    document.body.appendChild(el);
    if(asyncRenderSymbol in el) {
      await el[asyncRenderSymbol]();
    }
    yield * serialize(el);
    document.body.removeChild(el);
  }
}

export class ContextPart extends Part {
  constructor(prop) {
    super(0, 0);
    this.prop = prop;
  }
}

export class URLContextPart extends ContextPart {
  constructor(pathOrURL) {
    super('url');
    this.pathOrURL = pathOrURL;
  }

  async * render(_values, context) {
    if(!context || !('url' in context)) {
      yield this.pathOrURL;
      return;
    }

    let url = context.url;
    let resolvedURL = new URL(this.pathOrURL, url);
    let relPath = urlRelative(url, resolvedURL);
    yield relPath;
  }
}