#!/usr/bin/env node

const fs = require("fs");
const os = require("os");
const opn = require("opn");
const path = require("path");
const underscore = require("underscore")
const folders = require("platform-folders");

const settings = require("./settings")
const processor = require("./scripts/processor")

const AUTH_DIR = path.join(folders.getDataHome(), settings.app_name)
const TOKEN_PATH = path.join(AUTH_DIR, settings.token_name)
const CREDENTIALS_PATH = path.join(AUTH_DIR, settings.credentials_name)


// List all files in a directory in Node.js recursively in a synchronous fashion
function walkSync(dir, filelist) {
	let files = fs.readdirSync(dir);
	filelist = filelist || [];
	files.forEach(function(file) {
		let filepath = path.join(dir, file)
		if (fs.statSync(filepath).isDirectory()) {
			filelist = walkSync(filepath, filelist);
		} else {
			filelist.push(file);
		}
	});

	return filelist;
};


function move_file(from, to) {
	fs.mkdirSync(path.dirname(to), { recursive: true })
	fs.copyFileSync(from, to)
	fs.unlinkSync(from)
}


function setup_token() {
	let setup_config_path = path.join(__dirname, settings.setup_config_path)

	console.log("Need to auth to create the " + settings.token_name)
	console.log("Please restart the export to process all config")
	console.log("Process setup config for check token is correct...")

	return setup_config_path
}


async function load_config(config_path, sheet_name, rule_name) {
	let config = JSON.parse(fs.readFileSync(config_path))
	settings.runtime.config_dir = path.dirname(config_path)

	if (sheet_name) {
		config.sheets = config.sheets.filter((sheet) => {
			return sheet.name == sheet_name
		})
	}

	// Post-process config
	for (let i in config.sheets) {
		let sheet = config.sheets[i]
		let rule_path = path.join(settings.runtime.config_dir, sheet.rule)
		sheet.rule = JSON.parse(fs.readFileSync(rule_path))

		if (rule_name) {
			let single_rule = {}
			single_rule[rule_name] = sheet.rule.rules[rule_name]
			sheet.rule.rules = single_rule
		}

		for (let j in sheet.save) {
			sheet.save[j].temp_dist = sheet.save[j].dist.replace(/\.\./g, ".")
			sheet.save[j].temp_dir = fs.mkdtempSync(os.tmpdir());
		}
	}

	console.log("Start export data")
	console.log("Config path:", config_path)
	console.log("Sheet:", sheet_name || "All sheets")
	console.log("Rule:", rule_name || "All rules")
	console.log("")

	return config
}


async function download_export(config) {
	let promise = new Promise((resolve) => {
		let part_resolve = underscore.after(config.sheets.length, resolve)

		for (let i in config.sheets) {
			processor.process_sheet(config.sheets[i], part_resolve)
		}
	})

	await promise
	return config
}


async function validate_export(config) {
	return config
}


async function apply_data(config) {
	for (let i in config.sheets) {
		for (let j in config.sheets[i].save) {
			let save_param = config.sheets[i].save[j]
			let files = walkSync(save_param.temp_dir)
			for (let k in files) {
				let from_path = path.join(save_param.temp_dir, save_param.temp_dist, files[k])
				let to_path = path.join(settings.runtime.config_dir, save_param.dist, files[k])

				move_file(from_path, to_path)
				console.log("Upload file", to_path)
			}
		}
	}
}


function start_pipeline(config_path, sheet, rule_name) {
	load_config(config_path, sheet, rule_name)
		.then(download_export)
		.then(validate_export)
		.then(apply_data)
}


function setup_credentials() {
	console.log("Start setup of sheets-exportes")
	console.log("Please login and download credentials.json here:")
	console.log()
	console.log("https://developers.google.com/drive/api/v3/quickstart/nodejs")
	console.log()
	console.log("And place credentials in " + CREDENTIALS_PATH)
	opn("https://developers.google.com/drive/api/v3/quickstart/nodejs")
}


function help() {
	console.log("Wrong args, usage:")
	console.log("sheets-exporter {path_to_config} [sheet_name] [rule_name]")
}


function start() {
	let config_path_arg = process.argv[2] || ""
	fs.mkdirSync(AUTH_DIR, {recursive: true})

	if (!fs.existsSync(CREDENTIALS_PATH)) {
		setup_credentials()
		return
	}

	let config_path
	if (!fs.existsSync(TOKEN_PATH)) {
		config_path = setup_token()
	}

	config_path = config_path || path.join(process.cwd(), config_path_arg)
	let sheet = process.argv[3]
	let rule_name = process.argv[4]

	if (!config_path_arg) {
		help()
		return
	}

	start_pipeline(config_path, sheet, rule_name)
}

start()
