const spreadsheets = require('./spreadsheets')
const {google} = require('googleapis')
const convertor = require("./convertor")

const M = {}

M.download = function(sheet, rule, callback) {
	let download_counter = 0
	let lists = []
	auth_sheet(sheet.id, (data, auth) => {
		for (let ii = 0; ii < rule.parts.length; ii++) {
			let list_finded = false
			for (let j = 0; j < data.sheets.length; j++) {
				let sheet_data = data.sheets[j]
				if (sheet_data.properties.title == rule.parts[ii]) {
					list_finded = true
					download_counter++
					// Timeout because of google api restrictions
					lists.push(sheet_data)
				}
			}
			if (!list_finded) {
				console.log("[ERROR]: No list with name: " + rule.parts[ii])
			}
		}
		// download in order

		let all_data = []
		let cur_index = 0
		let queue_callback
		queue_callback = function() {
			get_csv(lists[cur_index], sheet.id, auth, (data) => {
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
	})
}

function auth_sheet(id, cb) {
	spreadsheets.auth(function(auth) {
		const sheets = google.sheets({version: 'v4', auth});

		let request = {
			spreadsheetId: id
		};

		sheets.spreadsheets.get(request, (err, res) => {
			if (err) return console.log('The API returned an error: ' + err);
			cb(res.data, auth)
		})
	})
}

function number_to_letter(n) {
    let result = '';

    if (n <= 26) {
      result = String.fromCharCode(64 + n);
    } else {      
      let div = Math.floor(n / 26);
      result = number_to_letter(div) + number_to_letter(n - div * 26 );
    }

    return result;
  }

function get_csv(sheet_data, id, auth, on_end) {
	let sheetRange = sheet_data.properties.title + '!A:' + number_to_letter(sheet_data.properties.gridProperties.columnCount);
	get_sheet_json(id, sheetRange, auth, on_end);
}

function get_sheet_json(id, range, auth, on_end) {
	get_rows(id, range, auth, function(data) {
		// rows are ready
		if (on_end) {
			on_end(data)
		}
	});
}

function is_number(val) {
	if (!isNaN(parseFloat(val))) {
		return val == String(parseFloat(val))
	}
	return false
}

function get_rows(id, range, auth, cb) {
	let sheets = google.sheets('v4');
	let request = {
		auth: auth,
		spreadsheetId: id,
		range: range,
	};

	sheets.spreadsheets.values.get(request, function(err, response) {
		if (err) {
			console.log('The API returned an error: ' + err);
			return;
		}

		let values = response.data.values;
		let usedCols = [];

		for (let i = 0; i < values[0].length; i++) {
			// если название начинается с `#`, то эту колонку НЕ надо экспортировать
			// если название пустое, то колонка тоже игнорируется!
			if (values[0][i].length > 0 && values[0][i].indexOf('#') != 0) {
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

					if (val.toLowerCase() === "false") {
						val = false
					} else if (val.toLowerCase() === "true") {
						val = true
					}
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
				if ((typeof row[0] !== "string" || row[0].indexOf('#') != 0) && !is_all_values_empty) {
					rows.push(row);
				}
			}
		}

		cb(rows)
	});
}


module.exports = M