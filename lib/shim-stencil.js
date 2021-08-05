
export function isStencil(Ctr) {
  return typeof Ctr.prototype.componentOnReady === 'function';
}

export function shimStencil(name, Ctr) {
  Ctr.prototype[Symbol.for('ocean.asyncRender')] = Ctr.prototype.componentOnReady;

  // Stencil does a weird thing that breaks localName, so let's fix it.
  const connectedCallback = Ctr.prototype.connectedCallback;
  Ctr.prototype.connectedCallback = function() {
    if(!this.localName) {
      this.localName = name;
    }
    return connectedCallback.apply(this, arguments);
  }
}