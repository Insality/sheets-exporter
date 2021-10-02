# Config
Config file is entry point config for **sheets-exporter**.

It's look like:
```js
{
	"sheets":[
	{
		"name": "config", // Name of document. You can use any
		"type": "csv_web", // Type. Can be "csv_web" for Google Sheets or "file" for local files
		"id": "1zMW_3dB73O--rUQ0zLlpco6RcvGNe9x-pN8qC3pqH9w", // If csv_web - ID of google sheets document
		"rule": "../config/rules_config.json", // Path to rules config for selected document
		"save": [{ 
			"dist": "./dist/", // Folder path for save data. Relative to this config
			"format": "lua" // "csv", "lua" or "json"
		}] // You can point several configs for save data in different formats
	}]
}
```

# Rules
Rules file is config for which and how process data.

It's look like:
```js
{
	"rules": {
		"relics_sets": { // Name of sheet config. Filename will be equal to it
			"parts": ["relics_sets"] // List of google sheets. It is the name of the sheet. You can point several of sheets, but they need to have equal headers (it will merge them)
		},

		"relics_items": {
			"parts": ["relics_items"],
			"type": "list", // By default, csv imported as map, you can export all sheet as a list by add this type
			"handlers": [ // List of how handle your documents
				{
				// The handlers description see in other docs file (docs/03_handlers.md)
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
					"type": "convert_array" // Make strings like <some, string, 2> to value [some, string, 2]
				}
			]
		}
	}
}
```