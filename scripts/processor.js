const fs = require('fs')
const path = require("path")

const settings = require("../settings")
const csv = require("../libs/csv")
const saver = require("../libs/saver")
const convertor = require("../libs/convertor")
const handlers = require("./handlers")

const M = {}


function read_file(file, filetype, callback, filename) {
	fs.readFile(file, "utf8", (err, data) => {
		if (err) throw err
		if (filetype == "json") {
			callback(JSON.parse(data), filename)
		}
	})
}


function load_file(sheet, rule, callback) {
	if (rule.file) {
		read_file(rule.file, rule.type, callback)
	}

	if (rule.dir) {
		fs.readdir(rule.dir, function(err, items) {
			for (let i in items) {
				let basename = path.basename(rule.dir + items[i], "." + rule.type)
				read_file(rule.dir + items[i], rule.type, callback, basename)
			}
		})
	}
}


function apply_handlers(data, handlers_list) {
	if (!handlers_list) {
		return data
	}

	for (let i in handlers_list) {
		data = handlers.use(data, handlers_list[i])
	}

	return data
}


function load(sheet, list_rule, callback) {
	if (sheet.type == "file") {
		load_file(sheet, list_rule, callback)
	}

	if (sheet.type == "csv_web") {
		csv.load_cache(sheet, list_rule, (rows) => {
			let rows_union = convertor.union_rows(rows)

			rows_union = apply_handlers(rows_union, list_rule.prehandlers)

			// get the json represent
			let json_data = convertor.rows2json(rows_union)
			callback(json_data)
		})
	}
}


M.process_sheet = function(sheet, special_rule) {
	let rule_path = path.join(settings.runtime.config_dir, sheet.rule)

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


function check_custom_handlers(sheet) {
	if (sheet.handlers) {
		let custom_handlers = {}
		for (let i in sheet.handlers) {
			let custom_handler = require(sheet.handlers[i])
			for (let key in custom_handler) {
				custom_handlers[key] = custom_handler[key]
			}
		}
		handlers.add_handlers(custom_handlers)
	}
}


function start_processing(sheet, special_rule, rule) {
	check_custom_handlers(sheet)

	for (let rule_name in rule.rules) {
		let list_rule = rule.rules[rule_name]

		if (special_rule && rule_name !== special_rule) {
			continue
		}

		load(sheet, list_rule, (json_data, filename) => {
			json_data = apply_handlers(json_data, sheet.all_handlers)
			json_data = apply_handlers(json_data, list_rule.handlers)
			save_file(json_data, sheet, list_rule, rule_name, filename)
		})
	}
}


function save_file(data, sheet, list_rule, rule_name, filename) {
	for (let i in sheet.save) {
		let dist = path.join(settings.runtime.config_dir, sheet.save[i].dist)
		let format = sheet.save[i].format

		if (sheet.wrap_with_name) {
			list_rule.save_param = list_rule.save_param || {}
			list_rule.save_param.name = list_rule.save_param.name || rule_name
		}

		filename = filename || rule_name
		if (list_rule.save_param) {
			saver.save_param(data, dist, filename, format, list_rule.save_param)
		} else {
			saver.save(data, dist, filename, format)
		}
	}
}


module.exports = M
