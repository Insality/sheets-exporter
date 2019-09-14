function add_id(data, config) {
	data[0].unshift("id")
	for (let i = 1; i < data.length; i++) {
		data[i].unshift(String(i))
	}
	return data
}


module.exports = {
	// Add index as first element to each row. "1", "2" etc
	add_id: add_id
}