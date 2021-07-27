
export class TextBinding {
  set(node, val) {
    node.data = val;
  }
}

export class AttributeBinding {
  constructor(name) {
    this.name = name;
  }
  set(node, val) {
    node.setAttribute(this.name, val);
  }
}

export class PropertyBinding {
  constructor(name) {
    this.name = name;
  }
  set(node, val) {
    Reflect.set(node, this.name, val);
  }
}