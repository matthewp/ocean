import { minify } from './deps.js';

export class HydrateLoad {
  constructor() {
    this.condition = 'load';
  }

  inject(head, _tagName, src) {
    let script = head.ownerDocument.createElement('script');
    script.setAttribute('src', src);
    script.setAttribute('type', 'module');
    head.append(script);
  }
}

export class HydrateIdle {
  constructor(tagName = 'ocean-hydrate-idle') {
    this.tagName = tagName;
    
    this.condition = 'idle';
    this.renderMultiple = false;
  }
  script() {
    return /* js */ `customElements.define('${this.tagName}', class extends HTMLElement {
      connectedCallback() {
        let src = this.getAttribute('src');
        this.parentNode.removeChild(this);
        requestIdleCallback(() => import(src));
      }
    })`
  }
}

export class HydrateMedia {
  constructor(tagName = 'ocean-hydrate-media', mediaAttr = 'ocean-query') {
    this.tagName = tagName;
    this.mediaAttr = mediaAttr;
    this.condition = 'media';
    this.renderMultiple = true;
  }
  mutate(hydrationEl, node) {
    let query = node.getAttribute(this.mediaAttr);
    hydrationEl.setAttribute('query', query);
  }
  script() {
    return /* js */ `customElements.define('${this.tagName}', class extends HTMLElement {
      connectedCallback() {
        let src = this.getAttribute('src');
        this.parentNode.removeChild(this);
        let mql = matchMedia(this.getAttribute('query'));
        let cb = () => import(src);
        if(mql.matches) cb();
        else mql.addEventListener('change', cb, { once: true });
      }
    })`
  }
}

export class HydrateVisible {
  
}

function validate(hydrators) {
  for(let hydrator of hydrators) {
    if(hydrator.tagName) {
      if(!('condition' in hydrator)) {
        throw new Error("This hydrator needs a 'condition' property.");
      }
      if(!('renderMultiple' in hydrator)) {
        throw new Error("This hydrator is missing the required 'renderMultiple' property.");
      }
    } else if(hydrator.inject) {

    } else {
      throw new Error('Unrecognized hydrator format');
    }
  }
  return hydrators;
}

const defaultHydrators = Object.freeze([HydrateLoad, HydrateIdle, HydrateMedia]);

function getHydrators(hydrationMethod, providedHydrators = []) {
  switch(hydrationMethod) {
    case 'none': {
      return [];
    }
    case 'partial': {
      let hydrators = providedHydrators.length ? providedHydrators : defaultHydrators.map(Hydrator => new Hydrator());
      return validate(hydrators);
    }
    case 'full': {
      return [HydrateLoad];
    }
    default: {
      throw new Error(`Invalid hydration method [${method}]`);
    }
  }
}

class TemplateHydration {
  constructor(hydration) {
    this.hydration = hydration;
    this.scripts = new Set();
    this.elements = new Set();
  }

  async addScript(hydrator, head, node) {
    let doc = node.ownerDocument;
    let script = doc.createElement('script');
    let { code } = await minify(hydrator.script());
    script.textContent = code;
    head.append(script);
  }

  addElement(hydrator, node, src) {
    let doc = node.ownerDocument;
    let hydrationEl = doc.createElement(hydrator.tagName);
    hydrationEl.setAttribute('src', src);
    if(hydrator.mutate) {
      hydrator.mutate(hydrationEl, node);
    }
    node.after(hydrationEl);
  }

  async run(hydrator, head, node, src) {
    if(hydrator.tagName) {
      let condition = hydrator.condition;

      if(hydrator.renderMultiple || !this.elements.has(hydrator.tagName)) {
        this.addElement(hydrator, node, src);
        this.elements.add(hydrator.tagName);
      }

      if(!this.scripts.has(condition)) {
        await this.addScript(hydrator, head, node);
        this.scripts.add(condition);
      }
    } else if(hydrator.inject) {
      hydrator.inject(head, node.localName, src);
    }
  }
  async handle(head, node, src) {
    let { hydrationAttr, hydratorMap, hydrators, method } = this.hydration;

    switch(method) {
      case 'full': {
        await this.run(hydrators[0], head, node, src);
        break;
      }
      case 'partial': {
        let condition = node.getAttribute(hydrationAttr);
        let hydrator = hydratorMap.get(condition);
        if(!hydrator) {
          throw new Error(`No hydrator provided for [${condition}]`);
        }
        node.removeAttribute(hydrationAttr);
        await this.run(hydrator, head, node, src);
        break;
      }
    }
  }
}

export class Hydration {
  #method;

  constructor(hydrationMethod, hydrationAttr, providedHydrators) {
    this.hydrationAttr = hydrationAttr || 'ocean-hydrate';
    this.method = hydrationMethod || 'partial';
    this.hydrators = getHydrators(this.method, providedHydrators);
    this.hydratorMap = new Map(this.hydrators.filter(h => h.condition).map(h => [h.condition, h]));
  }
  set method(val) {
    this.#method = val;
  }
  get method() {
    return this.#method;
  }
  createInstance() {
    return new TemplateHydration(this);
  }
}