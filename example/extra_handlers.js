function add_key(data, config) {
	for (let key in data) {
		let record = data[key]
		record[config.id] = config.value
	}

	return data
}


module.exports = {
	add_key: add_key
}
