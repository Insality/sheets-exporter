const settings = require("./settings")
const processor = require("./scripts/processor")

const fs = require("fs")
const path = require("path")

const AUTH_DIR = path.join(__dirname, settings.auth_dir)
const TOKEN_PATH = path.join(AUTH_DIR, settings.token_name)
const CREDENTIALS_PATH = path.join(AUTH_DIR, settings.credentials_name)


function download_export(config_path, sheet, rule_name) {
	let config = JSON.parse(fs.readFileSync(config_path))

	console.log("Start export data. Config: " + config_path)
	console.log(sheet || "All sheets,", rule_name || "all rules")

	let is_token_exist = fs.existsSync(TOKEN_PATH)

	for (let i in config.sheets) {
		if (i > 0 && !is_token_exist) {
			console.log("Need to auth to create the " + settings.token_name)
			console.log("Process only one sheet to get auth...")
			console.log("Please restart the export to process all config")
			return 0
		}

		if (!sheet) {
			processor.process_sheet(config.sheets[i], rule_name)
		} else {
			if (sheet == config.sheets[i].name) {
				processor.process_sheet(config.sheets[i], rule_name)
			}
		}
	}
}


function setup() {
	console.log("Start setup of sheets-exportes")
	console.log("Please login and download credentials.json here:")
	console.log()
	console.log("https://developers.google.com/drive/api/v3/quickstart/nodejs")
	console.log()
	console.log("And place credentials in " + CREDENTIALS_PATH)
}


const commands = {
	"export": download_export,
}


function start() {
	let root_folder = path.join(__dirname)
	console.log("Export tool. Exporter config: " + root_folder)

	fs.mkdirSync(AUTH_DIR, {recursive: true})

	if (!fs.existsSync(CREDENTIALS_PATH)) {
		setup()
		return
	}

	let config_path = process.argv[2]
	let sheet = process.argv[3]
	let rule_name = process.argv[4]

	settings.runtime.config_dir = path.dirname(config_path)

	let command = "export"
	if (commands[command]) {
		commands[command](config_path, sheet, rule_name)
	} else {
		console.log("Wrong arguments:")
		console.log("Usage:")
		console.log("run.sh [sheet_name] [rule_name] # for export data from google drive")
	}
}

start()