![](media/exporter_logo.png)
[![npm](https://img.shields.io/npm/v/sheets-exporter?label=sheets-exporter)](https://www.npmjs.com/package/sheets-exporter)

Sheets Exporter - CLI software for processing and save data from Google Sheets in seconds.

## Features
- Single command to download data from your Google Sheets
- Save your data in JSON/LUA/CSV format
- Use default data handlers to change your data in way your need
- Use your custom handlers for your specific keys
- Use hashtag `#` for comment lines or rows in Google Sheets
- Use `<>` for make arrays data
- Separate one Google list for several files _(example: game localization)_
- Gather data from several Google lists in one file (for easier big data management)
- Can process local files through rules handlers

## Install
The installation time about 5 minutes ⏱️.
Please read the [instructions here](/docs/01_installation.md)

## Setup configs
Glossary next:
 - **Config** - contains the google sheets document ID, rules for this document and how to save it.
 - **Rule** - contains information about which data is collect (lists for Google Sheets) and how it should be processed.
 
After successful credentials and token setup you can setup **sheets-exporter** configs:
- In any folder use `sheets-exporter init`
	- It will create basic config in default folder: `export_config`
	- you can move and edit this config if you want, but you need to pass the config path in the next commands otherwise
- Inside your folder use `sheets-exporter add_sheet {sheet_name} {sheet_id}`
	- The sheet_name - is the name of Google Sheet document
	- The sheet_id - the Google Sheet document. Gather it from URL. Example: `1V1X5CmbHJOwIu09Oso25H-ephOdYWlAv0xzicp75RT8`
- Inside your folder use `sheets-exporter add_rule {sheet_name} {list_name}`
	- The sheet_name - the name of config from previous step
	- The list_name - the name of Google Sheet list from document for export.

You can add any amount of rules to your document.
After basic setup done, you can check it with `sheets-exporter export`
The **sheets-exporter** process files inside temp folder and after successful pipeline, upload it to save folder. Check output log:
```
Upload file /Users/test/export_config/export_result/TokensConfig.json
```

You can check save folder inside your `config.json` file..

For more information how edit configs and use default and custom handlers please read the [instructions here](/docs/02_configs.md)


## Documentation
To better understand **sheets-exporter**, read the following documentation:
- [Install](docs/01_installation.md)
- [Configs](docs/02_configs.md)
- [Handlers](docs/03_handlers.md)
- [See FAQ article](docs/04_faq.md)


## License
Developed and supported by [Insality](https://github.com/Insality)


## Issues and suggestions
If you have any issues, questions or suggestions please  [create an issue](https://github.com/Insality/sheets-exporter/issues)  or contact me:  [insality@gmail.com](mailto:insality@gmail.com)

