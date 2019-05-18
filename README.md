# Sheets Exporter
#### by Insality

Sheets Exporter - CLI software for automated processing and save data from Google Sheets

Readme in process

## Install
Download repository
Run `npm install` to install dependencies
Make simple config (see config section)
Run `bash run.sh`. It will ask you to go web url for download **credentials.json**. Store it in `./auth/credentials.json`
Run second time, it will ask you go to another web url to get the token. Give access in your browser and copy token. Past it in console (just make what exporter ask you)

## Config
There is `config.json` file, main file for check what you need to export. You can make several of it and point needed config in `bash run.sh`. Default config file with name `config.json`

Config examples stores in `./config_templates`
Make config file in `/config/config.json`
It's look like:
```json
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
```json
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
- add_id

#### Handlers
- extract_id
- add_id_as_field
- union_fields
- union_by
- convert_array
- convert_field
- nest_data
- set_name
- field_to_array
- tuple_to_array
- array_to_map

#### Last handlers
Should be last, because change the structure of json
- values_list
- to_list


### TODO:
Custom handlers
Separate configs
More usefull docs and handlers
Make as npm package? For use it as tool with just config folder

### License
MIT License
By Insality
