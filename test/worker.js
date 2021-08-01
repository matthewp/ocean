import '../lib/shim.js?global';
import { Ocean } from '../lib/mod.bundle.js';

console.log(Ocean);

try {
  /*let { html } = new Ocean({
    document
  });*/

  postMessage({ type: 'result', result: { ok: true } });
} catch {
  postMessage({ type: 'result', result: { ok: true } });
}

