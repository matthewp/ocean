import { Compiler } from './compiler.js';

function must(opts, key) {
  if(!(key in opts)) {
    throw new Error(`The option [${key}] is missing.`);
  }
  return Reflect.get(opts, key);
}

export class Ocean {
  constructor(opts = {}) {
    this.document = must(opts, 'document');
    this.polyfillURL = opts.polyfillURL || null;

    this.templateCache = new WeakMap();

    this.compiler = new Compiler({
      document: this.document,
      polyfillURL: this.polyfillURL
    });

    this.html = this.html.bind(this);
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