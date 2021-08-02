/// <reference types="./ocean.d.ts" />

import { Compiler } from './compiler.js';
import { Hydration } from './hydration.js';

function must(opts, key) {
  if(!(key in opts)) {
    throw new Error(`The option [${key}] is missing.`);
  }
  return Reflect.get(opts, key);
}

export class Ocean {
  #polyfilURL;

  constructor(opts = {}) {
    this.document = must(opts, 'document');
    this.polyfillURL = opts.polyfillURL || null;
    this.hydrator = new Hydration(opts.hydration, opts.hydrationAttr, opts.hydrators);

    this.templateCache = new WeakMap();
    this.elements = new Map();

    this.compiler = new Compiler({
      document: this.document,
      elements: this.elements,
      hydrator: this.hydrator,
      polyfillURL: this.polyfillURL
    });

    this.html = this.html.bind(this);
  }

  set polyfillURL(val) {
    this.#polyfilURL = val;
    if(this.compiler) {
      this.compiler.polyfillURL = val;
    }
  }

  get polyfillURL() {
    return this.#polyfilURL;
  }

  async * html(strings, ...values) {
    let template;
    if(this.templateCache.has(strings)) {
      template = this.templateCache.get(strings);
    } else {
      template = this.compiler.compile(strings, values);
      this.templateCache.set(strings, template);
    }

    yield * template.render(values);
  }
}