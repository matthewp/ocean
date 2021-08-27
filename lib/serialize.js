import { voidElements } from './shared.js';
import { escape } from './escape.js';
const oceanSerializeSymbol = Symbol.for('ocean.serialize');

function * serializeFragment(frag) {
  for(let node of frag.childNodes) {
    yield * serialize(node);
  }
}

function isInsideScript(node) {
  return node.parentNode && node.parentNode.localName === 'script';
}

function * serializeElement(el) {
  if(oceanSerializeSymbol in el) {
    yield * el[oceanSerializeSymbol]();
    return;
  }

  yield `<${el.localName}`;
  for(let {name, value} of el.attributes) {
    if(value === '') {
      yield ` ${name}`;
    } else {
      yield ` ${name}="${value.replace(/"/g, '&quot;')}"`;
    }
  }
  yield `>`;

  if(voidElements.has(el.localName)) {
    return;
  }

  if(el.shadowRoot) {
    yield `<template shadowroot="open">`;
    yield * serializeFragment(el.shadowRoot);
    yield `</template>`;
  }

  for(let child of el.childNodes) {
    yield * serialize(child);
  }

  yield `</${el.localName}>`;
}

export function * serialize(node) {
  switch(node.nodeType) {
    case 1: {
      yield * serializeElement(node);
      break;
    }
    case 3: {
      if(isInsideScript(node))
        yield node.data;
      else 
        yield escape(node.data);
      break;
    }
    case 8: {
      yield `<!--${node.data}-->`;
      break;
    }
    case 10: {
      yield `<!doctype html>`;
      yield * serializeAll(node.childNodes);
      break;
    }
    case 11: {
      yield * serializeFragment(node);
      break;
    }
    default: {
      throw new Error('Unable to serialize nodeType ' + node.nodeType);
    }
  }
}

export function * serializeAll(nodes) {
  for(let node of nodes) {
    yield * serialize(node);
  }
}