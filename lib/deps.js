export { outdent } from 'https://deno.land/x/outdent@v0.8.0/mod.ts';
import 'https://unpkg.com/terser@5.7.1/dist/bundle.min.js';

export const minify = globalThis.Terser.minify;