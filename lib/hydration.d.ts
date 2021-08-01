export interface Hydrator {
  condition: string;
  tagName: string;
  renderMultiple: boolean;
  script(): string;
}

declare export class HydrateLoad implements Hydrator {}

declare export class HydrateIdle implements Hydrator {
  constructor(public tagName: string);
}

declare export class HydrateMedia implements Hydrator {
  constructor(public tagName: string, public mediaAttr: string);
}

declare export class HydrateVisible implements Hydrator {
  constructor(public tagName: string);
}