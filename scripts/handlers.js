const prehandlers = require("./handlers/prehandlers")
const default_handlers = require("./handlers/default_handlers")
const final_handlers = require("./handlers/final_handlers")

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
		if (handlers[key]) {
			console.log("[ERROR]: Overriding handler key", key)
		}
		handlers[key] = new_handlers[key]
	}
}


M.add_handlers(prehandlers)
M.add_handlers(default_handlers)
M.add_handlers(final_handlers)

module.exports = M
