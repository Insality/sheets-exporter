# FAQ

**Q:** What's mean next error:  `The API returned an error: Error: Unable to parse range: token_configs`

**A:** It's mean what in your Google Sheet document there is no list with name "token_configs". Check the document ID and list names.

---

**Q:** How use several lists in one file

**A:** You can point several name of lists in rules config. See on your headers in this lists, they have to be identical.
```json
"items": {
	"lists": ["items", "items_bonus", "items_dlc"]
}
```

---

**Q:** How generate several files from single list?

**A:** For simple key-value extract you can use "separate_langs" save_param in rules config around the handlers section:
```json
"handlers": [],
"save_param": {
	"separate_langs": [ // list of collumns to be separated
		"ru", "en"
	]
}
```

---

**Q:** For what purpose need to use "wrap_with_name" config fields?

**A:** I've use it for match protobuf structure. The protobuf forbid any unnamed structure.

---

**Q:** For what purpose I can use multiple handler's config for one handler?

**A:** Only for your comfort. Instead of specify several same handlers with different configs, you can use config's array instead:
```json
"handlers": [
	{
		"type" : "convert_number",
		"config": [{
				"field": "field_number_1"
			}, {
				"field": "field_number_2"
			}
		]
	}
]
```

---

**Q:** Is it safe yo use "unsafe google project"? Seems dangerous!

**A:** The "unsafe google project" is your newly created project. It's marked as unsafe because of "external" visibility and it's don't verified by Google. If you can select "internal" visibility - you can try use it.
Buy anyway, you know who use this project and it's safe for your purposes.

---

**Q:** Give me example for multiply list usages?

**A:** For example game quests: the quests data is quite big and it's can be comfortable to use several lists for quests (but keep headers the same!). Daily quests, story quests, dungeon quests etc.

---

**Q:** Give me example for several files from single list usages?

**A:** For example game localization: document contains *locale id* and translation for different languages in one sheet. Exporter can split this for several files: *ru_locale.json*, *en_locale.json* etc.

---

**Q:** Can I use **sheets-exporter** on CI server?

**A:** Sure. You can use single credentials for your project, but generate different token (probably for other user) and use it on CI.