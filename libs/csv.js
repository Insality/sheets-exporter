const fs = require("fs");
const os = require("os");
const path = require("path");
const {google} = require('googleapis')
const folders = require("platform-folders");

const saver = require("./saver");
const settings = require("../settings")
const convertor = require("./convertor")
const spreadsheets = require('./spreadsheets')

const M = {}

let CACHE_DIR = path.join(fs.mkdtempSync(os.tmpdir()));


function get_csv(list_name, id, callback) {
	let cached_file = path.join(CACHE_DIR, id, list_name + "." + settings.cache_format)
	let json_cache = JSON.parse(fs.readFileSync(cached_file, "utf8"))

	let values = json_cache.data
	let usedCols = []

	for (let i = 0; i < values[0].length; i++) {
		// Ignore rows, starts with "#" or name is empty
		if (values[0][i].length > 0 && values[0][i].indexOf(settings.ignore_export_symbol) !== 0) {
			usedCols.push(i)
		}
	}

	let rows = []
	for (let i = 0; i < values.length; i++) {
		let row = []
		for (let index of usedCols) {
			let val = values[i][index]
			if (settings.empty_value_alias.indexOf(val) >= 0) {
				val = ""
			}

			if (typeof(val) == "string") {
				val = val.trim()
			}

			val = convertor.check_number(val)

			row.push(val)
		}

		// Ignore row, if starts from ignore symbol
		if (row[0]) {
			var is_all_values_empty = true
			if (usedCols.length > 1) {
				for (let j = 1; j < row.length; j++) {
					if (row[j] !== "") {
						is_all_values_empty = false
					}
				}
			} else {
				is_all_values_empty = false
			}
			if ((typeof row[0] !== "string" || row[0].indexOf(settings.ignore_export_symbol) !== 0) && !is_all_values_empty) {
				rows.push(row)
			}
		}
	}

	callback(rows)
}


M.save_cache = function(lists, data) {
	let sheet_id = data.spreadsheetId
	let values = data.valueRanges

	for (let i in lists) {

		let listname = lists[i]
		let listdata = values[i].values
		let jsondata = {
			name: listname,
			data: listdata,
		}
		saver.save(jsondata, path.join(CACHE_DIR, sheet_id), listname, settings.cache_format, true)
	}
}


M.load_cache = function(sheet, rule, callback) {
	let all_data = []

	for (let i in rule.lists) {
		get_csv(rule.lists[i], sheet.id, (data) => {
			all_data.push(data)
		})
	}

	callback(all_data)
}


M.preload_lists = function(sheet_id, lists, callback) {
	spreadsheets.auth(function(auth) {
		const sheets = google.sheets({version: settings.google_sheets_api_version, auth})

		let request = {
			spreadsheetId: sheet_id,
			ranges: lists
		}

		sheets.spreadsheets.values.batchGet(request, (err, res) => {
			if (err) return console.log('The API returned an error: ' + err)
			M.save_cache(lists, res.data)
			callback()
		})
	})
}


module.exports = M
