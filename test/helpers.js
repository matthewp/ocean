const root = self[Symbol.for('dom-shim.defaultView')];

export const {
  HTMLElement,
  customElements,
  document
} = root;

const DOMParser = document.defaultView.DOMParser;

export async function consume(iter) {
  let out = '';
  for await(let chunk of iter) {
    out += chunk;
  }
  return out;
}

export function parse(string) {
  let parser = new DOMParser();
  let doc = parser.parseFromString(string, 'text/html', {
    includeShadowRoots: true
  });
  return doc;
}