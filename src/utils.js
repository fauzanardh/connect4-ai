module.exports = {
    range: num => [...Array(num).keys()],
    key: (row, col) => `${row}${col}`,
    cssUrl: id => `url(#${id})`,
    makeTitle: text => text[0].toUpperCase() + text.slice(1, text.length),
    min: num => Math.max(num - 3, 0),
    max: (num, max) => Math.min(num + 3, max)
}
