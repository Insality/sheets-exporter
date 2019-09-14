function beautify_lua(str) {
	let formatted = []

	let cur = 0
	let ident = 0
	let is_equal = false
	let is_string = false

	for (let i in str) {
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
				continue
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

module.exports = beautify_lua