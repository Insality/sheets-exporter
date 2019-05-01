const convertor = require("../libs/convertor");
const json2lua = require('json2lua');
const fs = require('fs');
const luafmt = require("lua-fmt")

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

function save_csv(json, path, name, no_beatify) {
	let csv_result = convertor.json2csv(json)
	let filename = path + name + ".csv"
	write_file(filename, csv_result)
}

function save_json(json, path, name, no_beatify) {
	let filename = path + name + ".json"
	write_file(filename, JSON.stringify(json))
}

function save_lua(json, path, name, no_beatify) {
	// clear json from undefined
	json = JSON.parse(JSON.stringify(json))

	let filename = path + name + ".lua"
	let lua_data = json2lua.fromObject(json)
	lua_data = "return " + lua_data

	// do not attempt to beatify quests (long time)
	if (no_beatify){
		write_file(filename, lua_data)
	}
	else{
		write_file(filename, luafmt.formatText(lua_data))
	}
}

M.save = function(json, path, name, format, json_name, no_beatify) {
	if (handlers[format]) {
		if (json_name) {
			let new_json = {}
			new_json[json_name] = json
			handlers[format](new_json, path, name, no_beatify)
		} else {
			handlers[format](json, path, name, no_beatify)
		}
	} else {
		console.log("[ERROR]: no format type: " + format)
	}
}

function separate_in(data, separate){
	let new_json = {}
	for (let j = 0; j < separate.fields.length; j++) {
		let fkey = separate.fields[j]
		new_json[fkey] = data[fkey]
		delete data[fkey]
	}
	return new_json
}

M.save_param = function(json, path, name, format, param) {
	if (param.folder) {
		path = path + param.folder + "/"
	}

	if (!fs.existsSync(path)){
		fs.mkdirSync(path);
	}

	// Split json to several files. Fields from original will be deleted
	if (param.separate) {
		for (let i = 0; i < param.separate.length; i++) {
			let separate = param.separate[i]
			let new_json
			if(separate.hasOwnProperty("direct")){
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
						  new_json.push( separate_in(json[key], separate) )
					  }
					}
			}
			M.save(new_json, path, name + separate.postfix, format, param.name, param.hasOwnProperty("no_beatify"))
		}
	}

	if (param.separate_langs) {
		let langs = param.separate_langs
		for (let i in langs) {
			let new_json = {}
			for (let key in json) {
				new_json[key] = json[key][langs[i]]
			}
			M.save(new_json, path, langs[i], format, param.name, param.hasOwnProperty("no_beatify"))
		}
		// dont save locales itself
		return
	}

	let new_json = {}
	new_json[param.name] = json
	M.save(json, path, name, format, param.name, param.hasOwnProperty("no_beatify"))
}


module.exports = M
