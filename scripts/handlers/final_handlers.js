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


function to_list(data, config) {
	let new_json = []

	for (let key in data) {
		new_json.push(data[key])
	}

	return new_json
}



function to_map(data, config) {
	for (let key in data) {
		data[key] = data[key][config.field]
	}
	return data
}



module.exports = {
	/// Should be as last handler. Change the json structure

	// Return list from value in each record or record key
	values_list: values_list,

	// Remove keys from json, transforming record to array
	to_list: to_list,

	// Convert whole record simple key-value map
	to_map: to_map,
}
