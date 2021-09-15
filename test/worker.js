import '../lib/shim.js?global';
import { Ocean } from '../lib/mod.bundle.js';

console.log(Ocean);

try {
  postMessage({ type: 'result', result: { ok: true } });
} catch {
  postMessage({ type: 'result', result: { ok: false } });
}

