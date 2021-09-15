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
  constructor(opts = {}) {
    this.document = must(opts, 'document');
    this.plugins = opts.plugins || [];
    this.hydrator = new Hydration(opts.hydration, opts.hydrationAttr, opts.hydrators);

    this.templateCache = new WeakMap();
    this.elements = new Map();

    this.settings = {
      polyfillURL: opts.polyfillURL || null
    };
    this.compiler = new Compiler({
      document: this.document,
      elements: this.elements,
      hydrator: this.hydrator,
      plugins: this.plugins,
      settings: this.settings,
    });

    this.html = this.html.bind(this);
    this.relativeTo = this.relativeTo.bind(this);
  }

  set polyfillURL(val) {
    this.settings.polyfillURL = val;
  }

  get polyfillURL() {
    return this.settings.polyfilURL;
  }

  #getTemplate(strings, values) {
    let template;
    if(this.templateCache.has(strings)) {
      template = this.templateCache.get(strings);
    } else {
      template = this.compiler.compile(strings, values);
      this.templateCache.set(strings, template);
    }
    return template;
  }

  async * html(strings, ...values) {
    yield * this.#getTemplate(strings, values).render(values);
  }

  async * #htmlRelative(url, strings, ...values) {
    let template = this.#getTemplate(strings, values);
    yield * template.render(values, {url});
  }

  relativeTo(_url) {
    let url = (_url instanceof URL) ? _url : new URL(_url.toString());
    return this.#htmlRelative.bind(this, url);
  }
}
