const convertor = require("../libs/convertor");
const json2lua = require('json2lua');
const fs = require('fs');
const luafmt = require("lua-fmt")
const beautify = require("json-beautify")

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
	let filename = path + "/" + name + ".csv"
	write_file(filename, csv_result)
}

function save_json(json, path, name, no_beatify) {
	let filename = path + "/" + name + ".json"
	if (no_beatify) {
		write_file(filename, JSON.stringify(json))
	} else {
		write_file(filename, beautify(json, null, 2, 120))
	}
}

function beautify_lua(str) {
	let formatted = []

	let cur = 0
	let ident = 0
	let is_equal = false
	let is_string = false

	for (let i = 0; i < str.length; i++) {
		let prev = str[i-1]
		let next = str[i+1]
		let char = str[i]

		if (char == "\"") {
			is_string = !is_string
		}
		if (is_string) {
			formatted[cur] = char
			cur++
			continue
		}

		if (char == "=") {
			is_equal = true
		}
		if (char == "{") {
			is_equal = false
			formatted[cur] = char
			cur++
			ident++
			if (next == "}") {
				continue;
			}
			formatted[cur] = "\n"
			cur++

			for (let j = 0; j < ident; j++) {
				formatted[cur] = "\t"
				cur++
			}
		} else if (char == "}") {
			is_equal = false
			if (prev == "{") {
				formatted[cur] = char
				cur++
				is_equal = true
				ident--
				continue
			}
			ident--
			formatted[cur] = "\n"
			cur++
			
			for (let j = 0; j < ident; j++) {
				formatted[cur] = "\t"
				cur++
			}
			formatted[cur] = char
			cur++
		} else if (char == ",") {
			formatted[cur] = char
			cur++
			if (is_equal || prev == "}") {
				is_equal = false
				formatted[cur] = "\n"
				cur++

				for (let j = 0; j < ident; j++) {
					formatted[cur] = "\t"
					cur++
				}
			}
		} else {
			formatted[cur] = char
			cur++
		}
	}

	return formatted.join("")
}

function save_lua(json, path, name, no_beatify) {
	// clear json from undefined
	json = JSON.parse(JSON.stringify(json))

	let filename = path + name + ".lua"
	let lua_data = json2lua.fromObject(json)
	lua_data = "return " + lua_data

	if (no_beatify) {
		write_file(filename, lua_data)
	} else {
		write_file(filename, beautify_lua(lua_data))
	}
}

M.save = function(json, path, name, format, no_beatify) {
	if (!fs.existsSync(path)){
		fs.mkdirSync(path);
	}

	if (handlers[format]) {
		handlers[format](json, path, name, no_beatify)
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
