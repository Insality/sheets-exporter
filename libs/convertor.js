const fs = require("fs")
const csvtojson = require('csvtojson')
const rows2csv_func = require("./array-to-csv")

const M = {}


M.rows2json = function(rows) {
	let data = {}

	let keys = rows[0]
	for (i = 1; i < rows.length; i++) {
		if (data[rows[i][0]]) {
			console.log("[WARNING]: Rewrite value in json")
			console.log(rows[i][0])
		}
		data[rows[i][0]] = {}
		let o = data[rows[i][0]]
		for (j = 1; j < rows[0].length; j++) {
			if (rows[i][j] !== "") {
				o[keys[j]] = rows[i][j]
			}
		}
	}

	return data
}


M.check_number = function(original) {
	let val = original
	if (!isNaN(parseFloat(val))) {
		val = val.trim()
		if (val.indexOf(".") !== -1) {
			val = val.replace(/0+$/, '')
		}
		if (val == String(parseFloat(val))) {
			return parseFloat(val)
		}
	}

	return original
}


M.json2rows = function(json) {
	let rows = []

	let header = []
	let obj = json[Object.keys(json)[0]]

	header.push("id")
	for (let key in obj) {
		header.push(key)
	}
	rows.push(header)


	for(let key in json) {
		let row = []
		row.push(key)

		for (let i = 1; i < header.length; i++) {
			row.push(json[key][header[i]])
		}
		rows.push(row)
	}
	return rows
}


M.json2csv = function(json) {
	let rows = M.json2rows(json)
	return rows2csv_func(M.json2rows(json))
}


M.csv2rows = function(csv_path, callback) {
	csvtojson({
		noheader:true,
		output: "csv"
	})
	.fromFile(csv_path)
	.then((csv_rows)=>{ 
		callback(csv_rows)
	})
}


M.union_rows = function(rows) {
	// check what rows has similar headers
	if (rows.length == 1) {
		return rows[0]
	}

	let keys = rows[0][0]

	let result = true
	for (i = 1; i < rows.length; i++) {
		let check = rows[i][0]
		for (j = 0; j < check.length; j++) {
			if (keys[j] != check[j]) {
				result = false
			}
		}
	}

	if (!result) {
		console.log("[ERROR]: The rows dont match headers")
		return false
	}

	let union = []
	union.push(keys)

	for (i = 0; i < rows.length; i++) {
		let row = rows[i]
		for (j = 1; j < row.length; j++) {
			union.push(row[j])
		}
	}

	return union
}

module.exports = M