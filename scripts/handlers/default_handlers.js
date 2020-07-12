const convertor = require("../../libs/convertor")


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


function add_id_by_values(data, config) {
	for (let index in config.ids) {
		let id = config.ids[index]
		let record = data[id];

		let record_keys = Object.keys(record);
		for (let i in record_keys) {
			let new_id = id + "_" + record_keys[i]
			data[new_id] = data[new_id] = {};
			for (let j in record_keys) {
				data[new_id][record_keys[j]] = record[record_keys[i]]
			}
		}
	}

	console.log(data["lang_name_ru"])

	return data
}


function array_to_map(data, config){
	for (let key in data) {
		let record = data[key]
		let new_json = {}
		for(let k in record[config.field]) {
			new_json[config.keys[k]] = record[config.field][k]
		}
		if (Object.keys(new_json).length > 0) {
			record[config.field] = new_json
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
			if (result.length > 0) {
				record[config.name] = result
			}
		}
		if (config.union_type == "map") {
			let result = {}

			for (let i = 0; i < config.fields.length; i++) {
				let value = record[config.fields[i]]
				let field_name = config.fields[i]
				if (config.alias) {
					field_name = config.alias[i]
				}
				if (value !== 0 && value != null){
					result[field_name] = value
				}
				delete record[config.fields[i]]
			}
			if (Object.keys(result).length > 0) {
				if (config.add_fields) {
					for (let k in config.add_fields) {
						result[k] = config.add_fields[k]
					}
				}
				record[config.name] = result
			}
		}
	}

	return data
}


function group_by(data, config) {
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
			new_json[key][config.list_name] = group_by(new_json[key][config.list_name], config.repeat)
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

function ensure_array(data, config) {
	for (let key in data) {
		let record = data[key]

		let field = record[config.field]
		if (field && typeof field !== "object") {
			record[config.field] = [record[config.field]]
		}
	}

	return data
}


function convert_number(data, config) {
	for (let key in data) {
		let record = data[key]

		record[config.field] = convertor.check_number(record[config.field])
	}

	return data
}


function convert_string(data, config) {
	for (let key in data) {
		let record = data[key]

		record[config.field] = String(record[config.field])
	}

	return data
}


function convert_boolean(data, config) {
	for (let key in data) {
		let record = data[key]

		for (let rkey in record) {
			let val = record[rkey]

			if (val == "true" || val == "True" || val == "TRUE") {
				record[rkey] = true
			}
			if (val == "false" || val == "False" || val == "FALSE") {
				delete record[rkey]
			}
		}
	}

	return data
}


function only_fields(data, config) {
	let new_json = {}

	for (let key in data) {
		new_json[key] = {}
		for (let j in config.ids) {
			let id_key = config.ids[j]
			if (data[key][id_key]) {
				new_json[key][id_key] = data[key][id_key]
			}
		}
	}

	return new_json
}


function remove_fields(data, config) {
	for (let key in data) {
		let record = data[key]
		for (let i in config.fields) {
			if (record[config.fields[i]]) {
				delete record[config.fields[i]]
			}
		}
	}
	return data
}


function rename_fields(data, config) {
	let keys = config.keys
	for (let key in data) {
		// Recursive
		if (typeof(data[key]) == "object") {
			data[key] = rename_fields(data[key], config)
		}

		for (let k in keys) {
			if (key == k) {
				// Copy data to delete it from another name
				data[keys[k]] = JSON.parse(JSON.stringify(data[key]))
				delete data[key]
			}
		}
	}
	return data
}


function to_map(data, config) {
	for (let key in data) {
		data[key] = data[key][config.field]
	}
	return data
}


module.exports = {
	// делит одну запись на несколько, меняя ID и используя указанные из полей
	// для каждой из них. В ключ дописывается постфикс
	extract_id: extract_id,

	// Add record key as value in this record
	add_id_as_field: add_id_as_field,

	// Add new ids from values list, add postfix from values
	add_id_by_values: add_id_by_values,

	// Group elements by key and union records under this key
	// Can be recursive
	group_by: group_by,

	// Convert record like <16 42> to [16, 42] json Array
	convert_array: convert_array,

	// Convert boolean strings to boolean
	convert_boolean: convert_boolean,

	// Convert field to number
	convert_number: convert_number,

	// Convert field to string
	convert_string: convert_string,

	// Union pointed fields to map
	nest_data: nest_data,

	// Union fields to map or array. Fields can be renamed
	union_fields: union_fields,

	// Transform array value <v1, v2, v3> to map with specific keys
	array_to_map: array_to_map,

	// Remove all ids except pointed in records
	only_fields: only_fields,

	// Remove pointed fields in records
	remove_fields: remove_fields,

	// Rename pointed fields in records
	rename_fields: rename_fields,

	// Make array from non array fields (from one element)
	ensure_array: ensure_array,

	// Convert table value to simple value from field, convert data to simple key-value
	to_map: to_map,
}
