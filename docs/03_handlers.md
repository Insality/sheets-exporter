# Handlers

## Handlers list

- **add_id_as_field** - Add record key as value in record
- **add_id_by_values** - Add new ids from values list, add postfix for id from values
- **array_to_map** - Transform array value <v1 v2 v3> to map with specific keys
- **convert_array** - Convert record like <16 42> to [14, 62] json Array
- **convert_boolean** - Convert boolean strings to boolean ("true"/"false" strings)
- **convert_number** - Convert field to number
- **convert_string** - Convert field to string
- **extract_id** - Split record on several records. Take fields and change id with key postfix
- **group_by** - Group elements by key and union records under this key, can be recursive
- **nest_data** - Union pointed fields to map
- **only_fields** - Remove all ids except pointed in records
- **remove_fields** - Remove pointed fields in records
- **rename_fields** - Rename pointed fields in records
- **to_map** - Convert record to value from this record
- **union_fields** - Union fields to map or array. Fields can be renamed

## Final Handlers list
- **values_list** - Use only key or specific value from records and generate array from it
- **to_list** - Transform map structure to array structure