#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const opn = require("opn");
const folders = require("platform-folders");

const settings = require("./settings")
const processor = require("./scripts/processor")


const AUTH_DIR = path.join(folders.getDataHome(), settings.app_name)
const TOKEN_PATH = path.join(AUTH_DIR, settings.token_name)
const CREDENTIALS_PATH = path.join(AUTH_DIR, settings.credentials_name)


function check_token(config_path) {
	if (fs.existsSync(TOKEN_PATH)) {
		return config_path
	}

	let setup_config_path = path.join(__dirname, settings.setup_config_path)

	console.log("Need to auth to create the " + settings.token_name)
	console.log("Please restart the export to process all config")
	console.log("Process setup config for check token is correct...")

	return setup_config_path
}

function download_export(config_path, sheet, rule_name) {
	config_path = check_token(config_path)

	let config = JSON.parse(fs.readFileSync(config_path))
	settings.runtime.config_dir = path.dirname(config_path)

	console.log("Start export data. Config: " + config_path)
	console.log(sheet || "All sheets,", rule_name || "all rules")

	for (let i in config.sheets) {
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
	opn("https://developers.google.com/drive/api/v3/quickstart/nodejs")
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