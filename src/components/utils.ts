import Validozer from 'validozer';
import { FieldState, StatePropType, FieldStateNested, FormSchema } from './FormHooks';

export const validateField = (fields: StatePropType["fields"], target: any, customMessage?: string | null) => {
	let { name, value, form, files, selectedOptions, type } = target;

	if (['checkbox', 'radio'].includes(type)) {
		value = Array.from((form as HTMLFontElement).querySelectorAll<HTMLInputElement>(`[name="${name}"]`))
			.filter((element) => element.checked)
			.map((box) => box.value);
		if (type === 'radio') {
			value = value[0];
		}
	}

	if (files) {
		value = files;
	}

	if (selectedOptions && target.multiple) {
		value = Array.from(selectedOptions);
	}

	const chained = getChainedField(name)

	const isArray = !isNaN(chained.index as any)

	const isChained = chained.subFields.length > 0

	let currentField

	if(isChained && fields[chained.field]) {
		currentField = chained.subFields.reduce((result: FieldState, subField: string) => {
			return result[subField]
		}, isArray ? fields[chained.field][chained.index!] : fields[chained.field])
	} else if(isArray && fields[chained.field]) {
		currentField = fields[chained.field][chained.index!]
	} else {
		currentField = fields[name]
	}

	if (!currentField) {
		console.error(fieldNotExists(name))
		return fields;
	}

	let updateField: FieldState
	
	if(customMessage === undefined) {
		// normal validation
		updateField = validateAndMutateField({
			...currentField,
			value,
		}, transformFieldsToJSON(fields))
	} else {
		// if customMessage is null we remove the error
		// but if it has a context we set an error
		const isNotNull = customMessage !== null
		updateField = {
			...currentField,
			isValidated: isNotNull,
			isInvalid: isNotNull,
			message: customMessage
		}
	}

	return { 
		...fields, 
		[isArray ? chained.field : name]: isArray ? (
			fields[chained.field].map((each: FieldState, index: number) => (
				index === chained.index ? (
					isChained ? (
                        updateChainedField(chained, updateField, {...(each as FieldStateNested)})
					) : (
						updateField
					)
				) : (
					each
				)
			))
		 ) : (
			updateField
		 )
	};
};

export const findOrCreateField = ({defaultValue = '', ...state}: FormSchema = {}):any => ({
	value: defaultValue,
	defaultValue,
	isInvalid: false,
	isValidated: false,
	message: null,
	...state,
});

export const immutableFields = (fields: StatePropType["fields"]) => (
	Object.keys(fields).reduce((result, name) => {
		if(Array.isArray(fields[name])) {
			result[name] = fields[name].map((each: FieldState) => {
				return isFieldState(each) ? {...each} : immutableFields(each)
			})
		} else {
			result[name] = {...fields[name]}
		}
		return result;
	}, {})
)


export const immutableFieldArray = (arrayFields: FieldState[] | FieldStateNested[]): FieldState[] | FieldStateNested[] => (
	(arrayFields as any).map((each: any) => {
		return isFieldState(each) ? {...each} : immutableFields(each)
	})
)

export const resetFields = (fields: StatePropType["fields"]) => (
	Object.keys(fields).reduce((result, name) => {
		if(Array.isArray(fields[name])) {
			result[name] = fields[name].map((each: FieldStateNested | FieldState) => {
				return isFieldState(each) ? ({
					...each,
					isInvalid: false,
					isValidated: false,
					message: null,
					value: each.defaultValue,
				}) : (
					resetFields(each)
				)
			})
		} else {
			result[name] = {
				...fields[name],
				isInvalid: false,
				isValidated: false,
				message: null,
				value: (fields[name] as FieldState).defaultValue,
			}
		}
		return result;
	}, {})
)

const transformFields = ({defaultValue = '', ...rawFields}: FormSchema, label: string) => {

	return {
		value: defaultValue,
		defaultValue,
		label,
		...rawFields,
		isInvalid: false,
		isValidated: false,
		message: null,
	}
}

export const transformDefaultFields = (fields: Record<string, FormSchema | FormSchema[]>): StatePropType["fields"] => (
	Object.keys(fields).reduce((result, name) => {
		if(Array.isArray(fields[name])) {
			result[name] = (fields[name] as FormSchema[]).map((each: FormSchema) => {
				return 'rules' in each || 'label' in each ? (
					transformFields(each, name)
				) : (
					transformDefaultFields(each as typeof fields)
				)
			})
		} else {
			result[name] = transformFields(fields[name] as FormSchema, name)
		}
		return result;
	}, {})
)

export const getChainedField = (name: string) => {
	let index
	const [field, ...subFields] = name.replace(/\[(\d+)\]/, (_, i) => {
		index = parseInt(i)
		return ""
	}).split('.')

	return {
		index,
		field,
		subFields
	}
}

const updateChainedField = (chained: ReturnType<typeof getChainedField>, subFieldValue: FieldState, rewrite: FieldStateNested) => (
    chained.subFields.reduce((result, subField, index, array) => {
		const isLastIndex = array.length - 1 === index

        if(isLastIndex) {
            result[subField] = subFieldValue

            return rewrite
        }
        return result[subField]
    }, rewrite)
)

export const validateAllFields = (fields: StatePropType["fields"], fieldsData: ReturnType<typeof transformFieldsToJSON>) => {
	return Object.keys(fields).reduce((result, key) => { 
		if(Array.isArray(fields[key])) {
			result[key] = fields[key].map((each: FieldState) => {
				return isFieldState(each) ? validateAndMutateField({...each}, fieldsData) : validateAllFields(each, fieldsData) 
			})
		} else {
			result[key] = validateAndMutateField({...(fields[key] as FieldState)}, fieldsData)
		}
		return result
	}, {})
}

export const transformFieldsToJSON = (fields: StatePropType["fields"]) => {
	if(Array.isArray(fields)) {
		return (fields as any).map((each: FieldState) => {
			return isFieldState(each) ? each.value : transformFieldsToJSON(each) 
		})
	} else {
		return Object.keys(fields).reduce<Record<string, any>>((result, key) => { 
			if(Array.isArray(fields[key])) {
				result[key] = fields[key].map((each: FieldState) => {
					return isFieldState(each) ? each.value : transformFieldsToJSON(each) 
				})
			} else {
				result[key] = (fields[key] as FieldState).value
			}
			return result
		}, {})
	}
}

export const validateAndMutateField = (currentField: FieldState, fieldsData: ReturnType<typeof transformFieldsToJSON>) => {
	const { label, rules, value } = currentField;

	if (rules) {
		Object.assign(
			currentField,
			Validozer.validate(
				value, 
				rules, 
				label,
				fieldsData
			),
			{ isValidated: true }
		);
	} else {
		Object.assign(
			currentField,
			{ isValidated: true, isInvalid: false }
		);
	}

	return currentField
}

export const computeFieldWhenReady = (fields: StatePropType["fields"]) => {
	return Object.keys(fields).every((name) => {
		return Array.isArray(fields[name]) ? (
			fields[name].every((each: FieldState) => {
				return isFieldState(each) ? !each.isInvalid : computeFieldWhenReady(each)
			})
		) : (
			!(fields[name] as FieldState).isInvalid
		)
	});
}

export const getClosestScrolled = (container: any) => {
    let ancestors;
    for (let elem = container.parentNode; elem && !ancestors; elem = elem.parentNode ) {
        if(elem.scrollHeight > elem.clientHeight || elem.scrollWidth > elem.clientWidth) {
			ancestors = elem;
		}
    }
    return ancestors || container
}

export const isFieldState = (item: any) => 'isInvalid' in item && 'isValidated' in item

const fieldNotExists = (name: string) => {
	return new TypeError(`field name \`${name}\` doesn't exists on the registered fields`)
}