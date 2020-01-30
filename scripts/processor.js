const fs = require('fs')
const path = require("path")

const csv = require("../libs/csv")
const saver = require("../libs/saver")
const handlers = require("./handlers")
const settings = require("../settings")
const convertor = require("../libs/convertor")

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


function map_to_list(data) {
	data[0].unshift("id")
	for (let i = 1; i < data.length; i++) {
		data[i].unshift(String(i))
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

			if (list_rule.type == "list") {
				rows_union = map_to_list(rows_union)
			}

			// get the json represent
			let json_data = convertor.rows2json(rows_union)
			callback(json_data)
		})
	}
}


M.process_sheet = async function(sheet, callback) {
	let rule = sheet.rule
	let lists = []
	for (let rule_name in rule.rules) {
		list_names = rule.rules[rule_name].lists

		for (let list_name in list_names) {
			if (lists.indexOf(list_names[list_name]) < 0) {
				lists.push(list_names[list_name])
			}
		}
	}

	let promise = new Promise((resolve) => {
		if (sheet.type == "csv_web") {
			console.log("Preload google docs lists:", lists.join(", "))
			csv.preload_lists(sheet.id, lists, () => {
				start_processing(sheet, rule)
				resolve()
			})
		} else {
			start_processing(sheet, rule)
			resolve()
		}
	})

	await promise
	callback()
}


function check_custom_handlers(sheet) {
	if (!sheet.handlers) {
		return
	}

	let custom_handlers = {}
	for (let i in sheet.handlers) {
		let handler_path = path.join(settings.runtime.config_dir, sheet.handlers[i])
		let custom_handler = eval(fs.readFileSync(handler_path, "utf8"))
		for (let key in custom_handler) {
			custom_handlers[key] = custom_handler[key]
		}
	}

	handlers.add_handlers(custom_handlers)
}


function start_processing(sheet, rule) {
	check_custom_handlers(sheet)

	for (let rule_name in rule.rules) {
		let list_rule = rule.rules[rule_name]

		load(sheet, list_rule, (json_data, filename) => {
			json_data = apply_handlers(json_data, sheet.all_handlers)
			json_data = apply_handlers(json_data, list_rule.handlers)
			save_file(json_data, sheet, list_rule, rule_name, filename)
		})
	}

	return true
}


function save_file(data, sheet, list_rule, rule_name, filename) {
	for (let i in sheet.save) {
		let dist = path.join(sheet.save[i].temp_dir, sheet.save[i].temp_dist)
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
