![](media/exporter_logo)

Sheets Exporter - CLI software for automated processing and save data from Google Sheets

Readme and software in process.

## Install
Download repository
Run `npm install` to install dependencies

Make simple config (see config section)

Run `bash run.sh`. It will ask you to go web url for download **credentials.json**. Store it in `./auth/credentials.json`

Run second time, it will ask you go to another web url to get the token. Give access in your browser and copy token. Past it in console (just make what exporter ask you)

## Config
There is `config.json` file, main file for check what you need to export. You can make several of it and point needed config in `bash run.sh`. 

Default config file with name `config.json`

Config examples stores in `./config_templates`

Make config file in `/config/config.json`

It's look like:
```js
{
	"sheets":[
	{
		"name": "config", // Name of document
		"type": "csv_web", // Type. Can be "csv_web" or "file"
		"id": "1zMW_3dB73O--rUQ0zLlpco6RcvGNe9x-pN8qC3pqH9w", // If csv_web - id of google sheets document
		"rule": "../config/rules_config.json", // Rules for selected document
		"save": [{
			"dist": "./dist/", // Dist for save
			"format": "lua" // "csv", "lua" or "json"
		}] // Save params, you can point several params to save in different place or formats
	}]
}
```
Rules for document looks like:

Full handlers list see below
```js
{
	"rules": {
		"relics_sets": { // Name of sheet config.
			"parts": ["relics_sets"] // List of google sheets. It is the name of the sheet. You can point several of sheets, but they need to have equal headers (it will merge them)
		},
		"relics_items": {
			"parts": ["relics_items"],
			"prehandlers": [ // Make stuff with rows, before convert to json
				{
					"type": "add_id"
				}
			],
			"handlers": [ // List of how handle your documets
				{
					"type": "union_by", // This one will group by field to map or list
					"config": {
						"field_id": "set_id",
						"list_name": "items",
						"remove_fields": ["id"]
					}
				},
				{
					"type": "add_id_as_field", // Copy key of json record to value
					"config": {
						"id": "set",
						"inner_list": "items"
					}
				}
			]
		},
		"orders": {
			"parts": ["orders"],
			"handlers": [
				{
					"type": "convert_array" // Just make strings like <some, string, 2> to value [some, string, 2]
				}
			]
		}
	}
}
```

### Handlers

#### Prehandlers
- **add_id**: Add numeric id as first value of every row. Use it if you have non unique keys and you want make list from this document
	*params*:
	*example*:

#### Handlers
- **extract_id**: Make many records from one by splitting it with different fields. Useful for localization
	*params*:
	*example*:
- **add_id_as_field**: Add key of the record to record data
	*params*:
	*example*:
- **union_fields**: Make array from pointed fields
	*params*:
	*example*:
- **union_by**: group records by field. This field will be on upper level of json struct. Can be recursive
	*params*:
	*example*:
- **convert_array**:  Make array from strings like `<26, 36, 42>` to [26, 36, 42]
	*params*:
	*example*:
- **convert_field** Format values by some rules. For example: percents
	*params*:
	*example*:
- **nest_data**: Union pointed fields to json with pointed key
	*params*:
	*example*:
- **set_name**: Add name before all json. It will change json struct. Usually use before saving
	*params*:
	*example*:

#### Last handlers
Should be last, because change the structure of json
- **values_list**: Make a list of values of some field
	*params*:
	*example*:
- **to_list**: Make list instead of dictionary
	*params*:
	*example*:


### TODO:
Custom handlers
Separate configs
More usefull docs and handlers
Make as npm package? For use it as tool with just config folder

### License
MIT License
By Insality
