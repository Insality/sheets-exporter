const processor = require("./processor")
const unzip = require("unzip")
const fs = require("fs")
const path = require("path")
const rimraf = require("rimraf");


function download_export(config_folder, sheet, rule_name) {
	let config_path = "./" + path.join(config_folder, "/config.json")
	let config = JSON.parse(fs.readFileSync(config_path))

	console.log("Start export data. Config: " + config_path)
	console.log(sheet || "All sheets,", rule_name || "all rules")

	let is_token_exist = fs.existsSync(path.join(__dirname, "../auth/token.json"))

	for (let i in config.sheets) {
		if (i > 0 && !is_token_exist) {
			console.log("Need to auth to create the token.json")
			console.log("Process only one sheet to get auth...")
			console.log("Please restart the export to process all config")
			return 0
		}
		setTimeout(() => {
			if (!sheet) {
				processor.process_sheet(config.sheets[i], rule_name)
			} else {
				if (sheet == config.sheets[i].name) {
					processor.process_sheet(config.sheets[i], rule_name)
				}
			}
		}, 750 * i)
	}
}

function setup() {
	console.log("Start setup of sheets-exportes")
	console.log("Please login and download credentials.json here:")
	console.log()
	console.log("https://developers.google.com/drive/api/v3/quickstart/nodejs")
	console.log()
	console.log("And place credentials in " + path.join(__dirname, "/auth/credentials.json"))
}

const commands = {
	"export": download_export,
}

function start() {
	let root_folder = path.join(__dirname, "..")
	console.log("Export tool. Exporter folder: " + root_folder)
	if (!fs.existsSync(path.join(root_folder, "auth"))) {
		fs.mkdirSync(path.join(root_folder, "auth"));
	}
	if (!fs.existsSync(path.join(root_folder, "/auth/credentials.json"))) {
		setup()
		return
	}

	let config_folder = process.argv[2]
	let sheet = process.argv[3]
	let rule_name = process.argv[4]

	let command = "export"
	if (commands[command]) {
		commands[command](config_folder, sheet, rule_name)
	} else {
		console.log("Wrong arguments:")
		console.log("Usage:")
		console.log("run.sh export [sheet_name] [rule_name] # for export data from google drive")
		console.log("run.sh locale # for prepare ready locale to the game (from ./dist/ready_locales.zip)")
	}
}

start()