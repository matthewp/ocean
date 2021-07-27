export const voidElements = new Set(['area', 'base', 'br', 'col', 'command',
'embed', 'hr', 'img', 'input', 'keygen', 'link', 'meta', 'param', 'source',
'track', 'wbr']);

export const nonClosingElements = new Set([
  ...voidElements,
  'html'
]);

export const validHeadElements = new Set(['!doctype', 'title', 'meta', 'link',
  'style', 'script', 'noscript', 'base']);

export const elementsBeforeBody = new Set([
  ...validHeadElements,
  'html'
]);