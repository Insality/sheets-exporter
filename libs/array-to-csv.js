module.exports = function (array, separator, alwaysQuote) {
  separator = separator || ','
  alwaysQuote = (alwaysQuote === true)
  return (Array.isArray(array)) ? array.map(joinRow, { separator: separator, alwaysQuote: alwaysQuote }).join('\n') : Object.values(array).map(joinRow, { separator: separator, alwaysQuote: alwaysQuote }).join('\n')
}

function joinRow(row) {
  return row.map(escapeCell, { separator: this.separator, alwaysQuote: this.alwaysQuote }).join(this.separator)
}

function escapeCell(cell) {
  cell = cell || ''
  if (typeof cell === 'function') cell = cell()
  cell = cell.toString()
  return (this.alwaysQuote || cell.indexOf(this.separator) !== -1 || cell.indexOf('"') !== -1 || cell.indexOf('\n') !== -1) ?
    '"' + cell.replace(/\"/g, '""') + '"' :
    cell
}