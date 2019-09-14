const spreadsheets = require('./spreadsheets')
const {google} = require('googleapis')
const convertor = require("./convertor")
const saver = require("./saver")
const fs = require("fs")
const path = require("path")

const M = {}

let cache_dir = path.join(__dirname, "../.cache/")

function get_csv(list_name, id, on_end) {
	let path = cache_dir + id + "/" + list_name + ".json"
	let json_cache = JSON.parse(fs.readFileSync(path, "utf8"))

	let values = json_cache.data;
	let usedCols = [];

	for (let i = 0; i < values[0].length; i++) {
		// Ignore rows, starts with "#" or name is empty
		if (values[0][i].length > 0 && values[0][i].indexOf('#') !== 0) {
			usedCols.push(i);
		}
	}

	let rows = [];
	for (let i = 0; i < values.length; i++) {
		let row = [];
		for (let index of usedCols) {
			let val = values[i][index]
			if (val == "-" || val == "none") {
				val = ""
			}

			if (typeof(val) == "string") {
				val = val.trim()
			}

			val = convertor.check_number(val)

			row.push(val);
		}

		// если значение из первой колонки начинается с `#`, то игнорим ВСЮ строку
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
			if ((typeof row[0] !== "string" || row[0].indexOf('#') !== 0) && !is_all_values_empty) {
				rows.push(row);
			}
		}
	}

	on_end(rows)
}


M.save_cache = function(lists, data) {
	let sheet_id = data.spreadsheetId
	let values = data.valueRanges

	if (!fs.existsSync(cache_dir)){
		fs.mkdirSync(cache_dir);
	}

	for (let i in lists) {

		let listname = lists[i]
		let listdata = values[i].values
		let jsondata = {
			name: listname,
			data: listdata,
		}
		saver.save(jsondata, cache_dir + sheet_id, listname, "json", true)
	}
}


M.load_cache = function(sheet, rule, callback) {
	let download_counter = 0
	let lists = rule.parts

	// download in order
	let all_data = []
	let cur_index = 0
	let queue_callback
	queue_callback = function() {
		get_csv(lists[cur_index], sheet.id, (data) => {
			download_counter--
			all_data.push(data)
			if (download_counter > 0) {
				cur_index++
				queue_callback()
			} else {
				callback(all_data)
			}
		})
	}
	queue_callback()
}


M.preload_lists = function(sheet_id, lists, cb) {
	spreadsheets.auth(function(auth) {
		const sheets = google.sheets({version: 'v4', auth});

		let request = {
			spreadsheetId: sheet_id,
			ranges: lists
		};

		sheets.spreadsheets.values.batchGet(request, (err, res) => {
			if (err) return console.log('The API returned an error: ' + err);
			M.save_cache(lists, res.data)
			if (cb) {
				cb()
			}
		})
	})
}

module.exports = M