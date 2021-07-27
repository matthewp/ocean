import { ComponentPart, TextPart } from './parts.js';
import { nonClosingElements } from './shared.js';
import { prefix } from './compiler-shared.js';

function htmlValue(htmlStr) {
  return {
    type: 'html',
    value: htmlStr
  };
}

function * walkFragment(frag, state) {
  for(let node of frag.childNodes) {
    yield * walk(node, state);
  }
}

function * walkElement(node, state) {
  let customElements = node.ownerDocument.defaultView.customElements;
  if(customElements.get(node.localName)) {
    yield {
      type: 'component',
      value: node
    }
    return;
  }

  yield htmlValue(`<${node.localName}`);
  for(let {name, value} of node.attributes) {
    if(value === '') {
      yield htmlValue(` ${name}`);
    } else {
      yield htmlValue(` ${name}="${value}"`);
    }
  }
  yield htmlValue(`>`);
  for(let child of node.childNodes) {
    yield * walk(child, state);
  }
  if(!nonClosingElements.has(node.localName)) {
    yield htmlValue(`</${node.localName}>`);
  }
}

function * walk(entryNode, state) {
  let node = entryNode;

  switch(node.nodeType) {
    case 1: {
      yield * walkElement(node, state);
      break;
    }
    case 3: {
      yield htmlValue(node.data);
      break;
    }
    case 8: {
      if(node.data === prefix) { 
        yield {
          type: 'hole'
        };
        state.i++;
      } else {
        yield htmlValue(`<!--${node.data}-->`);
      }
      
      break;
    }
    case 11: {
      yield * walkFragment(node, state);
      break;
    }
  }
}

export class Codegen {
  createTemplates(frag, doctype) {
    let templates = [];
    let buffer = '';

    let state = { i: 0, li: 0 };
    for(let { type, value } of walk(frag, state)) {
      switch(type) {
        case 'html': {
          buffer += value;
          break;
        }
        case 'hole': {
          templates.push(new TextPart(buffer, state.i, state.i + 1));
          buffer = '';
          break;
        }
        case 'component': {
          if(buffer) {
            templates.push(new TextPart(buffer, state.li, state.i));
            buffer = '';
          }
          templates.push(new ComponentPart(value, state));
          break;
        }
      }
      state.li = state.i;
    }

    if(buffer) {
      templates.push(new TextPart(buffer, state.i + 1));
    }

    if(doctype.match && templates[0] instanceof TextPart) {
      templates[0].addDoctype(doctype);
    }
    return templates;
  }
}