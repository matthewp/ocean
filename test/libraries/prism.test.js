import { unshim } from '../../lib/shim.js?global';
import * as Prism from 'https://cdn.skypack.dev/prismjs@1.24.1';
import { assertStringIncludes } from '../deps.js';

Deno.test('Can run Prism highlighting', async () => {
  let grammar = Prism.languages['js'];
  let out = Prism.highlight('let foo = "bar"', grammar, 'js');
  assertStringIncludes(out, 'span');
  unshim();
});