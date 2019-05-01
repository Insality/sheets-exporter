const csv = require("../libs/csv")
const saver = require("../libs/saver")
const convertor = require("../libs/convertor")
const handlers = require("./handlers")
const fs = require('fs')
const luaparse = require("luaparse")
var path = require('path');


const M = {}

function readFile(file, filetype, cb, filename) {
	fs.readFile(file, "utf8", (err, data) => {
		if (err) throw err;
		if (filetype == "json") {
			cb(JSON.parse(data), filename)
		}
	})
}

function load_file(sheet, rule, cb) {	
	if (rule.file) {
		readFile(rule.file, rule.type, cb)
	}
	if (rule.dir) {
		fs.readdir(rule.dir, function(err, items) {
			for (let i in items) {
				let basename = path.basename(rule.dir + items[i], "." + rule.type);
				readFile(rule.dir + items[i], rule.type, cb, basename)
			}
		});
	}
}

function load(sheet, list_rule, cb) {
	if (sheet.type == "file") {
		load_file(sheet, list_rule, cb)
	}
	if (sheet.type == "csv_web") {
		csv.download(sheet, list_rule, (rows) => {
			// union rows
			let rows_union = convertor.union_rows(rows)

			if (list_rule.prehandlers) {
				for (let i in list_rule.prehandlers) {
					rows_union = handlers.use(rows_union, list_rule.prehandlers[i])
				}
			}

			// get the json represent
			let json_data = convertor.rows2json(rows_union)
			cb(json_data)
		})
	}
}

M.process_sheet = function(sheet, special_rule) {
	let rule = require(sheet.rule)

	// get csv of selected lists
	for (let rule_name in rule.rules) {
		let list_rule = rule.rules[rule_name]

		if (special_rule && rule_name !== special_rule) {
			continue
		}

		load(sheet, list_rule, (json_data, filename) => {
			// use correct handler to convert json
			if (sheet.all_handlers) {
				for (let i in sheet.all_handlers) {
					json_data = handlers.use(json_data, sheet.all_handlers[i])
				}
			}
			if (list_rule.handlers) {
				for (let i in list_rule.handlers) {
					json_data = handlers.use(json_data, list_rule.handlers[i])
				}
			}

			for (let j = 0; j < sheet.save.length; j++) {
				let dist = sheet.save[j].dist
				let format = sheet.save[j].format

				// save
				if (!fs.existsSync(dist)){
					fs.mkdirSync(dist);
				}

				let clone_json = JSON.parse(JSON.stringify(json_data))

				if (sheet.wrap_with_name) {
					list_rule.save_param = list_rule.save_param || {}
					list_rule.save_param.name = rule_name
				}

				filename = filename || rule_name
				if (list_rule.save_param) {
					saver.save_param(clone_json, dist, filename, format, list_rule.save_param)
				} else {
					saver.save(clone_json, dist, filename, format)
				}
			}
		})
	}
}


M.prepare_locale_csv = function(filename, path, format) {
	let file_path = path + filename + format
	convertor.csv2rows(file_path, (rows) => {
		if (rows.length <= 0) {
			console.log("[ERROR]: no rows in csv: " + file_path)
		}
		let header = rows[0]

		for (let i = 1; i < header.length; i++) {
			let language = header[i]
			let lang_path = path + language + "/"
			if (!fs.existsSync(lang_path)){
				fs.mkdirSync(lang_path);
			}

			// prepare file for selected lang
			let json_data = []
			for (let j = 1; j < rows.length; j++) {
				json_data.push({
					"id": rows[j][0],
					"translation": rows[j][i]
				})
			}

			// write file to path
			saver.save(json_data, lang_path, filename, "json")
		}
		fs.unlinkSync(file_path) // delete file
	})
}


module.exports = M