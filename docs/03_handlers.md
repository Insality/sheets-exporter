# Handlers

General exporter handlers:
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