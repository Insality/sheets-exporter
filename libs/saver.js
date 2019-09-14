const beautify_lua = require("./beautify_lua")
const convertor = require("./convertor")
const json2lua = require('json2lua')
const fs = require('fs')
const beautify = require("json-beautify")
const path = require("path")

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


function save_json(json, filepath, name, no_beatify) {
	let filename = path.join(filepath, name + ".json")
	if (no_beatify) {
		write_file(filename, JSON.stringify(json))
	} else {
		write_file(filename, beautify(json, null, 2, 120))
	}
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


function wrap_with_name(json, name) {
	if (name) {
		let temp_json = {}
		temp_json[name] = json
		return temp_json
	}
	return json
}


M.save_param = function(json, filepath, name, format, param) {
	if (param.folder) {
		filepath = path.join(filepath, param.folder)
	}
	fs.mkdirSync(filepath, {recursive: true})

	json = wrap_with_name(json, param.name)

	if (param.filename) {
		name = param.filename
	}

	if (param.separate_langs) {
		let langs = param.separate_langs
		for (let i in langs) {
			let new_json = {}
			for (let key in json) {
				new_json[key] = json[key][langs[i]]
			}
			let filename = langs[i]
			if (param.filename) { 
				filename = param.filename + "_" + langs[i]
			}
			M.save(new_json, filepath, filename, format, param.no_beatify)
		}
		// dont save locales itself
		return
	}

	M.save(json, filepath, name, format, param.no_beatify)
}


module.exports = M
