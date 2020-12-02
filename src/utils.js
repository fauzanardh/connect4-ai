export const range = num => [...Array(num).keys()];

export const key = (row, col) => `${row}${col}`;
export const cssUrl = id => `url(#${id})`;
export const makeTitle = text => text[0].toUpperCase() + text.slice(1, text.length);
export const min = num => Math.max(num - 3, 0);
export const max = (num, max) => Math.min(num + 3, max);
