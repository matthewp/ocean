import { ComponentPart, URLContextPart, TextPart } from './parts.js';
import { nonClosingElements } from './shared.js';
import {
  commentPlaceholder,
  urlContextPrefix,
  prefix
} from './compiler-shared.js';
import { escapeAttributeValue } from './escape.js';

const interpolationExp = new RegExp(commentPlaceholder + '|' +
  `<!--${urlContextPrefix}=(.+)-->`, 'g');

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

function * urlContextValue(path) {
  yield {
    type: 'url-context',
    value: path
  };
}

function * multiInterpolation(str, state) {
  interpolationExp.lastIndex = 0;
  let match = interpolationExp.exec(str);
  let strIndex = 0;
  while(match) {
    let html = str.substr(strIndex, match.index - strIndex);
    yield htmlValue(html);
    let matchedPoint = match[0];
    if(matchedPoint === commentPlaceholder) {
      yield * holeValue(state);
    } else if(matchedPoint.includes(urlContextPrefix)) {
      yield * urlContextValue(match[1]);
    }
    strIndex = match.index + matchedPoint.length;
    match = interpolationExp.exec(str);
  }
  let html = str.substr(strIndex);
  yield htmlValue(html);

  /*let insertions = str.split(commentPlaceholder);
  let i = 0, len = insertions.length;
  do {
    if(i > 0) {
      yield * holeValue(state);
    }
    yield htmlValue(insertions[i]);
  } while(++i < len);
  */
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
      let escaped = escapeAttributeValue(value);
      yield * multiInterpolation(escaped, state);
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
    // Element
    case 1: {
      yield * walkElement(node, state);
      break;
    }
    // Text Node
    case 3: {
      // <title> for some reason only has text children
      yield * multiInterpolation(node.data, state);
      break;
    }
    // Comment Node
    case 8: {
      if(node.data === prefix) { 
        yield * holeValue(state);
      } else if(node.data === urlContextPrefix) {
        yield * urlContextValue();
      } else {
        yield htmlValue(`<!--${node.data}-->`);
      }
      
      break;
    }
    // DocumentFragment
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

    function closeBuffer(state) {
      if(buffer) {
        templates.push(new TextPart(buffer, state.li, state.i));
        buffer = '';
      }
    }

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
          closeBuffer(state);
          templates.push(new ComponentPart(value, state));
          break;
        }
        case 'url-context': {
          closeBuffer(state);
          templates.push(new URLContextPart(value));
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