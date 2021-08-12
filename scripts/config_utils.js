const fs = require("fs");
const path = require("path");
const settings = require("../settings");

const M = {};

const DEFAULT_CONFIG_PATH = path.join(process.cwd(), settings.default_config_path, settings.default_config_name);
const DEFAULT_CONFIG_TEMPLATE = fs.readFileSync(path.join(__dirname, "../config_templates/default_config.json")).toString('utf8');
const DEFAULT_RULES_CONFIG_TEMPLATE = fs.readFileSync(path.join(__dirname, "../config_templates/default_rules_config.json")).toString('utf8');
const DEFAULT_RULE_LIST_CONFIG = fs.readFileSync(path.join(__dirname, "../config_templates/default_rule_list_config.json")).toString('utf8');
const DEFAULT_SHEETS_CONFIG_TEMPLATE = fs.readFileSync(path.join(__dirname, "../config_templates/default_sheets_config.json")).toString('utf8');


function help_sheet_usage() {
	console.log("Usage:");
	console.log("sheets-exporter add_sheet sheet_name google_sheet_id {config_path}");
	console.log("\tsheet_name: The name of the sheet config, use any you want");
	console.log("\tgoogle_sheet_id: The id of Google sheet document, get it from the URL");
	console.log("\tconfig_path: Optional, path the config you want to change");
};


function help_rule_usage() {
	console.log("Usage:")
	console.log("sheets-exporter add_rule sheet_name list_name {config_path}")
	console.log("\tsheet_name: The name of the sheet config, use any you want")
	console.log("\list_name: The name of the list to export")
	console.log("\tconfig_path: Optional, path the config you want to change")
};


M.init_configs = function() {
	if (fs.existsSync(DEFAULT_CONFIG_PATH)) {
		console.log("Found config file:", DEFAULT_CONFIG_PATH);
		console.log("The config file is already exists, abort initing...");
		return;
	}

	fs.mkdirSync(DEFAULT_CONFIG_PATH, { recursive: true });
	fs.writeFileSync(DEFAULT_CONFIG_PATH, DEFAULT_CONFIG_TEMPLATE);

	console.log("Create default config:", DEFAULT_CONFIG_PATH);
};


M.add_sheet = function() {
	let sheet_name = process.argv[3];
	let sheet_id = process.argv[4];
	let config_path = process.argv[5] || DEFAULT_CONFIG_PATH;

	if (!sheet_name) {
		console.log("[ERROR]: The sheet_name is empty")
		help_sheet_usage();
		return;
	}

	if (!sheet_id) {
		console.log("[ERROR]: The sheet_id is empty")
		help_sheet_usage();
		return;
	}

	// Load config
	let config_data = JSON.parse(fs.readFileSync(config_path));
	let config_sheets = config_data.sheets;
	console.log("Load config:", config_path);

	// Check the config name is not exists
	for (let index in config_sheets) {
		if (config_sheets[index].name == sheet_name) {
			console.log("[ERROR]: The config name is already exists. Remove it or change sheet_id manually");
			console.log("Config:", sheet_name);
			return;
		}
	}

	// Add new config
	let default_sheets_config_string = DEFAULT_SHEETS_CONFIG_TEMPLATE.replace(/{CONFIG_NAME}/g, sheet_name);
	default_sheets_config_string = default_sheets_config_string.replace(/{GOOGLE_SHEETS_ID}/g, sheet_id);
	let default_sheets_config = JSON.parse(default_sheets_config_string);
	config_sheets.push(default_sheets_config)

	// Create rules for config
	let config_dir = path.dirname(config_path)
	let rules_path = path.join(config_dir, default_sheets_config.rule)
	if (fs.existsSync(rules_path)) {
		console.log("Found rules file:", rules_path);
		console.log("[ERROR]: cant create new rules for config, it's already exists");
	} else {
		fs.mkdirSync(path.dirname(rules_path), { recursive: true });
		fs.writeFileSync(rules_path, DEFAULT_RULES_CONFIG_TEMPLATE);
		console.log("Create new config rule config:", rules_path)
	}

	// Save new config
	console.log("Override config", config_path);
	let config_json = JSON.stringify(config_data, null, settings.json_export_spacing);
	fs.writeFileSync(config_path, config_json);
};


M.add_rule = function() {
	let sheet_name = process.argv[3];
	let list_name = process.argv[4];
	let config_path = process.argv[5] || DEFAULT_CONFIG_PATH;

	if (!sheet_name) {
		console.log("[ERROR]: The sheet_name is empty")
		help_rule_usage();
		return;
	}

	if (!list_name) {
		console.log("[ERROR]: The list_name is empty")
		help_rule_usage();
		return;
	}

	// Load config
	let config_data = JSON.parse(fs.readFileSync(config_path));
	let config_sheets = config_data.sheets;
	console.log("Load config:", config_path);

	// Load sheet data
	let relative_rule_path = null
	for (let index in config_sheets) {
		if (config_sheets[index].name == sheet_name) {
			relative_rule_path = config_sheets[index].rule;
		}
	}

	// Check rule exists
	let config_dir = path.dirname(config_path)
	let rule_path = path.join(config_dir, relative_rule_path)
	if (!fs.existsSync(rule_path)) {
		console.log("Rule path:", rule_path);
		console.log("[ERROR]: The rule file is not exists");
		return;
	}

	// Load rule
	let rule_data = JSON.parse(fs.readFileSync(rule_path));
	console.log("Load rule config:", rule_path);

	// Check rule is not declared
	if (rule_data.rules[list_name]) {
		console.log("[ERROR]: The rule name is already exists, remove it or change manually");
		console.log("Rule name:", list_name);
		return;
	}

	// Add new rule
	let default_rule_config = DEFAULT_RULE_LIST_CONFIG.replace(/{LIST_NAME}/g, list_name);
	let default_rule_config_json = JSON.parse(default_rule_config)[list_name];
	rule_data.rules[list_name] = default_rule_config_json
	console.log("Add new rule for list:", list_name)

	// Save rules
	console.log("Override rules", rule_path);
	let rule_json = JSON.stringify(rule_data, null, settings.json_export_spacing);
	fs.writeFileSync(rule_path, rule_json);
};

module.exports = M;
