const settings = require("../settings")
const csv = require("../libs/csv")
const saver = require("../libs/saver")
const path = require("path")
const convertor = require("../libs/convertor")
const handlers = require("./handlers")
const fs = require('fs')


const M = {}

function readFile(file, filetype, cb, filename) {
	fs.readFile(file, "utf8", (err, data) => {
		if (err) throw err
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
				let basename = path.basename(rule.dir + items[i], "." + rule.type)
				readFile(rule.dir + items[i], rule.type, cb, basename)
			}
		})
	}
}


function load(sheet, list_rule, cb) {
	if (sheet.type == "file") {
		load_file(sheet, list_rule, cb)
	}
	if (sheet.type == "csv_web") {
		csv.load_cache(sheet, list_rule, (rows) => {
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
	let rule_path = path.join(settings.runtime.config_dir, sheet.rule)
	console.log(rule_path)

	let rule = JSON.parse(fs.readFileSync(rule_path))

	// get csv of selected lists
	// Get all list names to cache it
	let lists = []
	for (let rule_name in rule.rules) {
		if (special_rule && rule_name !== special_rule) {
			continue
		}

		list_names = rule.rules[rule_name].lists

		for (let list_name in list_names) {
			if (lists.indexOf(list_names[list_name]) < 0) {
				lists.push(list_names[list_name])
			}
		}
	}

	if (sheet.type == "csv_web") {
		console.log("Preload lists:", lists.join(", "))
		csv.preload_lists(sheet.id, lists, () => {
			start_processing(sheet, special_rule, rule)
		})
	} else {
		start_processing(sheet, special_rule, rule)
	}
}


function start_processing(sheet, special_rule, rule) {
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
				let dist = path.join(settings.runtime.config_dir, sheet.save[j].dist)
				let format = sheet.save[j].format
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


module.exports = M
