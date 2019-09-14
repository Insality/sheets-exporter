const convertor = require("../libs/convertor")
const M = {}

const handlers = {
	/// Обычные обработчики. Они возвращают измененый json

	// делит одну запись на несколько, меняя ID и используя указанные из полей
	// для каждой из них. В ключ дописывается постфикс
	extract_id: extract_id,

	// добавляет в запись поле с id этой записи
	add_id_as_field: add_id_as_field,

	// добавляет все указанные поля в одно поле как массив
	union_fields: union_fields,

	// выделяет одно из полей выше уровнем, и все записи с одинаковым значением поля
	// добавляет в мапу под этим полем. Может быть рекурсивным
	union_by: union_by,

	// превращает записи вида <16 42> в массив [16, 42]
	convert_array: convert_array,

	// форматирует по правилам определенное поле в записях (например, указаны проценты)
	convert_field: convert_field,

	// указанные поля в записи объединяет в массив с указанным ключем
	nest_data: nest_data,

	// добавляет имя перед всем json
	set_name: set_name,

	// превращает список элемента json в мапу. Ключи указаны в конфиге
	// в нужном порядке
	array_to_map: array_to_map,


	/// Should be as last handler. Change the json structure
	// возвращает список, вытаскивая из каждой записи опр. поле
	values_list: values_list,

	// убирает id у всех записей, превращает данные в массив
	to_list: to_list,


	/// Prehandlers
	// Add index as first element to each row. "1", "2" etc
	add_id: add_id
}

function add_id(data, config) {
	data[0].unshift("id")
	for (let i = 1; i < data.length; i++) {
		data[i].unshift(String(i))
	}
	return data
}


function add_id_as_field(data, config) {
	for (let key in data) {
		let v = data[key]
		if (config.inner_list) {
			v = v[config.inner_list]
			for (let i in v) {
				v[i][config.id] = key
			}
		} else {
			v[config.id] = key
		}
	}
	return data
}


function extract_id(data, config) {
	let new_json = {}

	for (let key in data) {
		let record = data[key]

		for (let postfix in config.ids) {
			new_json[key + postfix] = {}

			let o = new_json[key + postfix]

			let is_all_values_empty = true
			for (let i = 0; i < config.keys.length; i++) {
				o[config.keys[i]] = record[config.ids[postfix][i]]

				if (record[config.ids[postfix][i]] != "") {
					is_all_values_empty = false
				}
			}
			if (is_all_values_empty) {
				delete new_json[key + postfix]
			}
		}
	}

	return new_json
}

function values_list(data, config) {
	let row = []

	for (let key in data) {
		if (config.is_key) {
			row.push(key)
		} else {
			row.push(data[key][config.id])
		}
	}

	return row
}

function convert_field(data, config) {
	for (let key in data) {
		let record = data[key]

		if (record[config.id]) {
			if (config.type == "percent") {
				record[config.id] = parseFloat(record[config.id])/100
			}
		}
	}

	return data
}

function array_to_map(data, config){
	for (let key in data) {
		let record = data[key]
		for (let i in config) {
			if (!record.hasOwnProperty(config[i].field) ){
				continue
			}
			let array = []
			for(let k in record[config[i].field]){
				let new_json = {}
				for(let j in config[i].keys){
					new_json[config[i].keys[j]] = record[config[i].field][k][j]
				}
				array.push(new_json)
			}
			record[config[i].field] = array
		}
	}
	return data
}

function union_fields(data, config) {
	for (let key in data) {
		let record = data[key]

		if (config.union_type == "array") {
			let result = []
			for (let i = 0; i < config.fields.length; i++) {
				let value = record[config.fields[i]]
				if (value !== 0 && value != null){
					result.push(value)
				}
				delete record[config.fields[i]]
			}
			record[config.name] = result
		}

		if (config.union_type == "table") {
			let result = {}
			for (let i = 0; i < config.fields.length; i++) {
				let value = record[config.fields[i]]
				if (value !== 0 && value != null){
					result[config.fields[i]] = value
				}
				delete record[config.fields[i]]
			}
			record[config.name] = result
		}
	}

	return data
}

function set_name(data, config) {
	let new_data = {}
	new_data[config.name] = data
	return new_data
}

function union_by(data, config) {
	let new_json = {}
	let fid = config.field_id
	let list_name = config.list_name

	for (let key in data) {
		let record = data[key]

		if (config.type == "map") {
			if (!new_json[record[fid]]) {
				new_json[record[fid]] = {}
				new_json[record[fid]][list_name] = {}
			}
			new_json[record[fid]][list_name][key] = record
		} else {
			if (!new_json[record[fid]]) {
				new_json[record[fid]] = {}
				new_json[record[fid]][list_name] = []
			}
			let id_name = config.id_name || "id"
			record[id_name] = key
			new_json[record[fid]][list_name].push(record)
		}

		if (config.remove_fields) {
			for (let i in config.remove_fields) {
				let f = config.remove_fields[i]
				delete record[f]
			}
		}

		if (config.extract_fields) {
			for (let i = 0; i < config.extract_fields.length; i++) {
				let f = config.extract_fields[i]
				new_json[record[fid]][f] = record[f]
				delete record[f]
			}
		}

		delete record[fid]
	}

	if (config.type == "map") {
		for (let key in new_json) {
			let record = new_json[key]
			let new_map = {}
			for (let i in record[config.list_name]) {
				let r = record[config.list_name][i]
				for (let k in r) {
					new_map[k] = r[k]
				}
			}
			record[config.list_name] = new_map
		}
	}

	if (config.repeat) {
		for (let key in new_json) {
			new_json[key][config.list_name] = union_by(new_json[key][config.list_name], config.repeat)
		}
	}

	return new_json
}

function make_array(str_val) {
	str_val = str_val.replace(/</g, "")
	str_val = str_val.replace(/>/g, "")
	str_val = str_val.replace(/\[/g, "")
	str_val = str_val.replace(/\]/g, "")
	str_val = str_val.trim()
	str_val = str_val.replace(/:/g, " ")
	str_val = str_val.replace(/,/g, " ")
	str_val = str_val.replace(/\s\s+/g, ' ')
	let arr = str_val.split(" ")

	for (let i = 0; i < arr.length; i++) {
		arr[i] = convertor.check_number(arr[i])
	}

	return arr
}

function nest_data(data, config) {
	for (let key in data) {
		let record = data[key]

		let k = record[config.parent_id]
		let chunk = {}
		for (let i in config.fields) {
			chunk[config.fields[i]] = record[config.fields[i]]
			delete record[config.fields[i]]
		}

		record[k] = chunk
		delete record[config.parent_id]
	}

	return data
}

function convert_array(data, config) {
	for (let key in data) {
		let record = data[key]

		for (let rkey in record) {
			let field = record[rkey]
			// TODO: check if string and transform to array if <>
			if (typeof field === "string" || field instanceof String) {
				if ((field.indexOf("<") > -1 && field.indexOf(">") > -1) ||
					(field.indexOf("[") > -1 && field.indexOf("]") > -1)) {
					record[rkey] = make_array(field)
				}
			}
		}
	}

	return data
}

function to_list(data, config) {
	let new_json = []

	for (let key in data) {
		new_json.push(data[key])
	}

	return new_json
}

M.use = function(data, handler) {
	if (handlers[handler.type]) {
		return handlers[handler.type](data, handler.config)
	} else {
		console.log("[ERROR]: no config name: " + handler.type)
	}
}

module.exports = M
