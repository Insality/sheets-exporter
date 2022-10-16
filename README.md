![](media/exporter_logo.png)
[![Github-sponsors](https://img.shields.io/badge/sponsor-30363D?style=for-the-badge&logo=GitHub-Sponsors&logoColor=#EA4AAA)](https://github.com/sponsors/insality) [![Ko-Fi](https://img.shields.io/badge/Ko--fi-F16061?style=for-the-badge&logo=ko-fi&logoColor=white)](https://ko-fi.com/insality) [![BuyMeACoffee](https://img.shields.io/badge/Buy%20Me%20a%20Coffee-ffdd00?style=for-the-badge&logo=buy-me-a-coffee&logoColor=black)](https://www.buymeacoffee.com/insality)

[![npm](https://img.shields.io/npm/v/sheets-exporter?label=sheets-exporter)](https://www.npmjs.com/package/sheets-exporter)

Sheets Exporter - CLI software for processing and save data from Google Sheets in seconds.

See  [Export Example](docs/05_example_export.md) to get the idea how it's work.

## Features
- Single command to download data from your Google Sheets
- Save your data in JSON/LUA/CSV format
- Use default data handlers to change your data in way your need
- Use your custom handlers for your specific cases
- Use hashtag `#` for comment rows or columns in Google Sheets
- Use `<>` or `[]` for make arrays data in Google Sheets (need add `convert_array` handler)
- Convert `true` or `false` (or Google checkbox values) values to JSON boolean values (need add `convert_boolean` handler)
- Separate one Google list for several files _(usage example: game localization)_
- Gather data from several Google lists in one file (for easier big data management)
- Can process local files through handlers

## Install
The installation time about 5 minutes ⏱️.
Please read the [instructions here](/docs/01_installation.md)

## Setup configs
Glossary next:
 - **Config** - contains the google sheets document ID, rules for this document and how to save it.
 - **Rule** - contains information about which data is collect (lists for Google Sheets or local files) and how it should be processed.
 
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

You can check save folder inside your `config.json` file.

For more information how edit configs and use default and custom handlers please read the [instructions here](/docs/02_configs.md).

You can check full config example here: [Full Config Example](https://github.com/Insality/defold-eva/tree/master/export_config)


## Documentation
To better understand **sheets-exporter**, read the following documentation:
- [Install](docs/01_installation.md)
- [Configs](docs/02_configs.md)
- [Handlers](docs/03_handlers.md)
- [See FAQ article](docs/04_faq.md)
- [Export Example](docs/05_example_export.md)
- [Full Config Example](https://github.com/Insality/defold-eva/tree/master/export_config)


## License
Developed and supported by [Insality](https://github.com/Insality)


## Issues and suggestions
If you have any issues, questions or suggestions please  [create an issue](https://github.com/Insality/sheets-exporter/issues)  or contact me:  [insality@gmail.com](mailto:insality@gmail.com)


## ❤️ Support project ❤️

Please support me if you like this project! It will help me keep engaged to update this project.

[![Github-sponsors](https://img.shields.io/badge/sponsor-30363D?style=for-the-badge&logo=GitHub-Sponsors&logoColor=#EA4AAA)](https://github.com/sponsors/insality) [![Ko-Fi](https://img.shields.io/badge/Ko--fi-F16061?style=for-the-badge&logo=ko-fi&logoColor=white)](https://ko-fi.com/insality) [![BuyMeACoffee](https://img.shields.io/badge/Buy%20Me%20a%20Coffee-ffdd00?style=for-the-badge&logo=buy-me-a-coffee&logoColor=black)](https://www.buymeacoffee.com/insality)
