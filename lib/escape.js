// From https://github.com/WebReflection/linkedom/blob/a2347651a9c6bc44c272af0c9fd83f4931cbab2d/esm/shared/text-escaper.js
const {replace} = '';

// escape
const ca = /[<>&\xA0]/g;

const esca = {
  '\xA0': '&nbsp;',
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;'
};

const pe = m => esca[m];

/**
 * Safely escape HTML entities such as `&`, `<`, `>` only.
 * @param {string} es the input to safely escape
 * @returns {string} the escaped input, and it **throws** an error if
 *  the input type is unexpected, except for boolean and numbers,
 *  converted as string.
 */
export const escapeHTML = es => replace.call(es, ca, pe);

export const escapeAttributeValue = value => value.replace(/"/g, '&quot;')