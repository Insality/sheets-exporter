const default_handlers = require("./default_handlers")

const M = {}

let handlers = {}

M.use = function(data, handler) {
	if (handlers[handler.type]) {
		return handlers[handler.type](data, handler.config)
	} else {
		console.log("[ERROR]: no handler with name: " + handler.type)
	}
}


M.add_handlers = function(new_handlers) {
	for (let key in new_handlers) {
		handlers[key] = new_handlers[key]
	}
}

M.add_handlers(default_handlers)

module.exports = M
