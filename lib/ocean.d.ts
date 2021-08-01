import type { Hydrator } from './hydration.js';

export interface OceanOptions {
  document: any;
  hydration: 'full' | 'partial' | 'none';
  hydrators: Hydrator[];
  polyfillURL: string;
}

declare class Ocean {
  polyfillURL: string;
  elements: Map<string, string>;

  constructor(opts?: OceanOptions);

  html(strings: string[], ...values: any[]): AsyncIterator<string, void, undefined>;
}

export {
  Ocean
}