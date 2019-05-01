const config = require("../config/config")
const processor = require("./processor")
const unzip = require("unzip")
const fs = require("fs")
const rimraf = require("rimraf");


function download_export(sheet, rule_name) {
	console.log("Start export data:")
	console.log(sheet || "all sheets,", rule_name || "all rules")

	let is_token_exist = fs.existsSync("./auth/token.json")

	for (let i in config.sheets) {
		if (i > 0 && !is_token_exist) {
			console.log("Need to auth to create the token.json")
			console.log("Process only one sheet to get auth...")
			console.log("Please restart the export to process all config")
			return
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

function prepare_locale() {
	console.log("Start preparing locales...")

	const file_list = [
		"quests",
		"ui",
		"buildings",
		"items",
		"shop",
		"resources"
	]

	rimraf.sync("./dist/ready_locales/") // like rm -rf

	fs.createReadStream('./dist/ready_locales.zip')
		.pipe(unzip.Extract({ path: './dist/ready_locales' }))
		.on('close', function (err) {
			for (let i = 0; i < file_list.length; i++) {
				processor.prepare_locale_csv(file_list[i], "./dist/ready_locales/", ".csv")
			}
			console.log("End of export ready locales")
	});
}

function setup() {
	console.log("Start setup of sheets-exportes")
	console.log("Please login and download credentials.json here:")
	console.log()
	console.log("https://developers.google.com/drive/api/v3/quickstart/nodejs")
	console.log()
	console.log("And place credentials in ./auth/credentials.json")
}

const commands = {
	"export": download_export,
}

function start() {
	console.log("Export tool")
	if (!fs.existsSync("./dist")) {
		fs.mkdirSync("./dist");
	}
	if (!fs.existsSync("./auth")) {
		fs.mkdirSync("./auth");
	}
	if (!fs.existsSync("./auth/credentials.json")) {
		setup()
		return
	}

	let command = process.argv[2] || "export"
	let sheet = process.argv[3]
	let rule_name = process.argv[4]

	if (commands[command]) {
		commands[command](sheet, rule_name)
	} else {
		console.log("Wrong arguments:")
		console.log("Usage:")
		console.log("run.sh export [sheet_name] [rule_name] # for export data from google drive")
		console.log("run.sh locale # for prepare ready locale to the game (from ./dist/ready_locales.zip)")
	}
}

start()