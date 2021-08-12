#!/usr/bin/env node

const fs = require("fs");
const os = require("os");
const opn = require("opn");
const path = require("path");
const underscore = require("underscore");
const folders = require("platform-folders");

const settings = require("./settings");
const processor = require("./scripts/processor");
const config_utils = require("./scripts/config_utils")

const AUTH_DIR = path.join(folders.getDataHome(), settings.app_name);
const TOKEN_PATH = path.join(AUTH_DIR, settings.token_name);
const CREDENTIALS_PATH = path.join(AUTH_DIR, settings.credentials_name);
const DEFAULT_CONFIG_PATH = path.join(process.cwd(), settings.default_config_path, settings.default_config_name);


// List all files in a directory in Node.js recursively in a synchronous fashion
function walk_sync(dir, filelist) {
	let files = fs.readdirSync(dir);
	filelist = filelist || [];
	files.forEach(function(file) {
		let filepath = path.join(dir, file);
		if (fs.statSync(filepath).isDirectory()) {
			filelist = walk_sync(filepath, filelist);
		} else {
			filelist.push(file);
		}
	});

	return filelist;
};


function move_file(from, to) {
	fs.mkdirSync(path.dirname(to), { recursive: true });
	fs.copyFileSync(from, to);
	fs.unlinkSync(from);
};


function setup_token() {
	let setup_config_path = path.join(__dirname, settings.setup_config_path);

	console.log("Need to auth to create the " + settings.token_name);
	console.log("Please restart the export to process all config");
	console.log("Process setup config for check token is correct...");

	return setup_config_path;
};


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
			let files = walk_sync(save_param.temp_dir)
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
};


function setup_credentials() {
	console.log("Start setup of sheets-exportes");
	console.log("Please login and download credentials.json here:");
	console.log();
	console.log("https://developers.google.com/drive/api/v3/quickstart/nodejs");
	console.log();
	console.log("And place credentials in " + CREDENTIALS_PATH);
	opn("https://developers.google.com/drive/api/v3/quickstart/nodejs");
};


function help() {
	console.log("Wrong args, usage:");
	console.log("sheets-exporter {path_to_config} [sheet_name] [rule_name]");
};


function init_configs() {
	if (fs.existsSync(DEFAULT_CONFIG_PATH)) {
		console.log("Found config file:", DEFAULT_CONFIG_PATH);
		console.log("The config file is already exists, abort initing...");
		return;
	}

	fs.mkdirSync(DEFAULT_CONFIG_PATH, { recursive: true });
	console.log("init configs call");
};



function add_rule() {
	console.log("add rule call");
};


function add_sheet() {
	console.log("add sheet call");
};


function export_configs() {
	console.log("export configs call");
};


let COMMANDS = {
	// (config_path)
	"init": config_utils.init_configs,
	"setup": setup_credentials,
	// (sheet_name, sheet_id, {config_path})
	"add_sheet": config_utils.add_sheet,
	// (sheet_name, list_name, {config_path})
	"add_rule": config_utils.add_rule,
	"help": help,
	"export": export_configs,
}


function start() {
	fs.mkdirSync(AUTH_DIR, {recursive: true})
	if (!fs.existsSync(CREDENTIALS_PATH)) {
		setup_credentials()
		return
	}

	let command_argument_or_config = process.argv[2];
	console.log("COMMAND", command_argument_or_config);

	if (COMMANDS[command_argument_or_config]) {
		COMMANDS[command_argument_or_config]();
		return;
	} else {
		command_argument_or_config = command_argument_or_config || DEFAULT_CONFIG_PATH
	}

	let config_path
	// TODO: Move to help and setup commands
	if (!fs.existsSync(TOKEN_PATH)) {
		config_path = setup_token()
	}

	config_path = config_path || path.join(process.cwd(), command_argument_or_config)
	let sheet = process.argv[3];
	let rule_name = process.argv[4];

	if (!command_argument_or_config) {
		help()
		return
	}

	start_pipeline(config_path, sheet, rule_name)
}

start()
