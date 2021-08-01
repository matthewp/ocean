export interface Hydrator {
  condition: string;
  tagName: string;
  renderMultiple: boolean;
  script(): string;
}

export declare class HydrateLoad {
  condition: 'load';

  constructor();
}

export declare class HydrateIdle implements Hydrator {
  condition: 'idle';
  tagName: string;
  renderMultiple: boolean;

  constructor(tagName: string);
  script(): string;
}

export declare class HydrateMedia implements Hydrator {
  condition: 'media';
  tagName: string;
  renderMultiple: boolean;

  constructor(tagName: string, mediaAttr: string);
  script(): string;
}

export declare class HydrateVisible implements Hydrator {
  condition: 'visible';
  tagName: string;
  renderMultiple: boolean;

  constructor(tagName: string);
  script(): string;
}