const beautify_lua = require("./beautify_lua")
const convertor = require("./convertor")
const json2lua = require('json2lua')
const fs = require('fs')
const path = require("path")
const settings = require("../settings")

const M = {}

const handlers = {
	"csv": save_csv,
	"lua": save_lua,
	"json": save_json,
}


function write_file(filename, data) {
	fs.writeFileSync(filename, data)
	console.log("Saved file: " + filename)
}


function save_csv(json, filepath, name, no_beatify) {
	let csv_result = convertor.json2csv(json)
	let filename = path.join(filepath, name + ".csv")
	write_file(filename, csv_result)
}


function get_sorted_json_keys(json) {
	let keys = [];

	for (let key in json) {
		keys.push(key);
		if (typeof json[key] == "object") {

			let inner_json_keys = get_sorted_json_keys(json[key]);
			for (let j in inner_json_keys) {
				keys.push(inner_json_keys[j])
			}
		}
	}

	// Unique values
	keys = keys.filter((v, i, a) => a.indexOf(v) === i); 
	return keys.sort();
}


function save_json(json, filepath, name, no_beatify) {
	let filename = path.join(filepath, name + ".json")
	let text_data = JSON.stringify(json, get_sorted_json_keys(json), settings.json_export_spacing)
	write_file(filename, text_data)
}


function save_lua(json, filepath, name, no_beatify) {
	// clear json from undefined
	json = JSON.parse(JSON.stringify(json))

	let filename = path.join(filepath, name + ".lua")
	let lua_data = json2lua.fromObject(json)
	lua_data = "return " + lua_data

	if (no_beatify) {
		write_file(filename, lua_data)
	} else {
		write_file(filename, beautify_lua(lua_data))
	}
}


M.save = function(json, filepath, name, format, no_beatify) {
	fs.mkdirSync(filepath, {recursive: true})

	if (handlers[format]) {
		handlers[format](json, filepath, name, no_beatify)
	} else {
		console.log("[ERROR]: no format type: " + format)
	}
}


function separate_in(data, separate) {
	let new_json = {}
	for (let j = 0; j < separate.fields.length; j++) {
		let fkey = separate.fields[j]
		new_json[fkey] = data[fkey]
		delete data[fkey]
	}
	return new_json
}


function check_separate(json, save_param, filepath, name, format) {
	if (!save_param.separate) {
		return
	}

	for (let i in save_param.separate) {
		let separate = save_param.separate[i]
		let new_json
		if (separate.direct){
			new_json = separate_in(json, separate)
		}
		else{
			  if (separate.type == "map") {
					new_json = {}
				}
				if (separate.type == "list") {
					new_json = []
				}
				for (let key in json) {
					if (separate.type == "map") {
						new_json[key] = separate_in(json[key], separate)
					}
					if (separate.type == "list") {
						new_json.push(separate_in(json[key], separate))
					}
				}
		}

		new_json = wrap_with_name(new_json, save_param.name)
		M.save(new_json, filepath, name + separate.postfix, format, save_param.no_beatify)
	}
}


function wrap_with_name(json, name) {
	if (name) {
		let temp_json = {}
		temp_json[name] = json
		return temp_json
	}
	return json
}


function check_separate_fields(json, param, filepath, format) {
	if (!param.separate_fields) {
		return false
	}

	let separate_fields = param.separate_fields
	for (let i in separate_fields) {
		let field = separate_fields[i]
		let new_json = {}
		for (let key in json) {
			new_json[key] = json[key][field]
		}
		let filename = field
		if (param.filename) { 
			filename = param.filename + "_" + field
		}
		M.save(new_json, filepath, filename, format, param.no_beatify)
	}

	return true
}


function check_append(json, param, filepath, name, format) {
	if (!param.is_append) {
		return json
	}
	if (format !== "json") {
		console.log("Append now working only with JSON")
		return json
	}

	try {
		file_data = fs.readFileSync(filepath + name + "." + format, "utf8")
	} catch (err) {
		file_data = "{}"
	}

	let file_json = JSON.parse(file_data) || {}
	file_json[param.name] = json[param.name]
	return file_json
}


M.save_param = function(json, filepath, name, format, param) {
	if (param.folder) {
		filepath = path.join(filepath, param.folder)
	}
	fs.mkdirSync(filepath, {recursive: true})

	if (param.filename) {
		name = param.filename
	}

	// Split json to several files. Fields from original will be deleted
	check_separate(json, param, filepath, name, format)
	let is_skip_saving = check_separate_fields(json, param, filepath, format)

	if (!is_skip_saving) {
		json = wrap_with_name(json, param.name)

		json = check_append(json, param, filepath, name, format)
		M.save(json, filepath, name, format, param.no_beatify)
	}
}


module.exports = M
