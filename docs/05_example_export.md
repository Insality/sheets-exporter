# Export Example

## Default export (no handlers)

**Source:**

![](export_source_items.png)

**Result:**

```json
{
  "axe": { "damage": 10, "range": 4, "speed": 2 },
  "fireball": {"damage": 20, "range": 15, "speed": 5 },
  "frostball": {"damage": 15, "range": 20, "speed": 6 },
  "longsword": {"damage": 12, "range": 6, "speed": 2.5 },
  "pickaxe": {"damage": 8, "range": 7, "speed": 1 },
  "pistol": {"damage": 20, "range": 20, "speed": 1 },
  "shotgun": {"damage": 15, "range": 15, "speed": 3 },
  "sword": {"damage": 5, "range": 5, "speed": 1.2 }
}
```

## Handler "values list"

**Source:**

![](export_source_items.png)

**Result:**

```json
[
  "sword", "axe", "shotgun", "pistol", "pickaxe", "longsword", "fireball", "frostball"
]
```

## Separate localization
Save param with _separate_fields_

**Source:**

![](export_source_locales.png)

**Result:**

```json
// File ru.json
{
  "button_cancel": "Отмена",
  "button_ok": "Хорошо",
  "fireball": "Огненный шар",
  "frostball": "Ледянной шар",
  "game_hint": "Подсказка",
  "game_title": "Заголовок",
  "lightning": "Молния",
  "window_close": "Закрыть",
  "window_settings_header": "Настройки",
  "window_settings_hint": "Вы можете настроить игру тут"
}
```
```json
// File en.json
{
  "button_cancel": "Cancel",
  "button_ok": "Agree",
  "fireball": "Fireball",
  "frostball": "Frostball",
  "game_hint": "Some hint",
  "game_title": "Game title",
  "lightning": "Lightning",
  "window_close": "Close",
  "window_settings_header": "Settings",
  "window_settings_hint": "You can adjust settings here"
}
```