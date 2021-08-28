import { ComponentPart, TextPart } from './parts.js';
import { nonClosingElements } from './shared.js';
import { commentPlaceholder, prefix } from './compiler-shared.js';
import { escapeAttributeValue } from './escape.js';

function htmlValue(htmlStr) {
  return {
    type: 'html',
    value: htmlStr
  };
}

function * holeValue(state) {
  yield {
    type: 'hole'
  };
  state.i++;
}

function * multiInterpolation(str, state) {
  let insertions = str.split(commentPlaceholder);
  let i = 0, len = insertions.length;
  do {
    if(i > 0) {
      yield * holeValue(state);
    }
    yield htmlValue(insertions[i]);
  } while(++i < len);
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
      yield htmlValue(` ${name}="`);
      yield * multiInterpolation(escapeAttributeValue(value), state);
      yield htmlValue('"');
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
      // <title> for some reason only has text children
      yield * multiInterpolation(node.data, state);
      break;
    }
    case 8: {
      if(node.data === prefix) { 
        yield * holeValue(state);
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