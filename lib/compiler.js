import { outdent } from './deps.js';
import { Codegen } from './codegen.js';
import { Optimizer } from './optimize.js';
import { commentPlaceholder } from './compiler-shared.js';

class Template {
  constructor(parts) {
    this.parts = parts;
  }
  async * render(values, context) {
    let parts = this.parts;

    for(let part of parts) {
      let partValues = values.slice(part.start, part.end);
      yield * part.render(partValues, context);
    }
  }
}

class Doctype {
  constructor(raw) {
    this.raw = raw;
    this.match = /(<!doctype html>)/i.exec(raw);
    this.source = this.match ? this.match[0] : null;
    this.start = this.match ? this.match.index : null;
    this.end = this.match ? this.match.index + this.source.length : null;
  }
  remove() {
    if(!this.match) {
      return this.raw;
    }
    return this.raw.slice(0, this.start) + this.raw.slice(this.end);
  }
  replace(part) {
    if(!this.match) {
      return part;
    }
    return part.slice(0, this.start) + this.source + part.slice(this.start);
  }
}

export class Compiler {
  constructor(opts) {
    this.document = opts.document;
    this.polyfillURL = opts.polyfillURL;
    this.optimizer = new Optimizer({
      document: this.document,
      elements: opts.elements,
      hydrator: opts.hydrator,
      plugins: opts.plugins,
      settings: opts.settings
    });
    this.codegen = new Codegen();
  }

  compile(parts, values) {
    let document = this.document;
    let replacedValues = Array.from({ length: values.length }, _ => commentPlaceholder);
    let raw = outdent(parts, ...replacedValues);
    let doctype = new Doctype(raw);
    raw = doctype.remove();
  
    let div = document.createElement('div');
    div.innerHTML = raw;
    let frag = document.createDocumentFragment();
    frag.append(...div.childNodes);
  
    this.optimizer.optimize(frag);
    let templates = this.codegen.createTemplates(frag, doctype);
  
    return new Template(templates);
  }
}