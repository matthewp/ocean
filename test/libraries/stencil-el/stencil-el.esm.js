import { p as promiseResolve, b as bootstrapLazy } from './p-3e6d962c.js';

/*
 Stencil Client Patch Browser v2.6.0 | MIT Licensed | https://stenciljs.com
 */
const patchBrowser = () => {
    const importMeta = import.meta.url;
    const opts = {};
    if (importMeta !== '') {
        opts.resourcesUrl = new URL('.', importMeta).href;
    }
    return promiseResolve(opts);
};

patchBrowser().then(options => {
  return bootstrapLazy([["p-952c5330",[[1,"stencil-el",{"first":[1],"middle":[1],"last":[1]}]]]], options);
});
