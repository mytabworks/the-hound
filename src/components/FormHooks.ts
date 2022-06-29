import { useState, useContext, createContext, useCallback, useMemo } from 'react';
import { FormEvent } from './FormEvent';
import { 
	transformDefaultFields, 
	findOrCreateField, 
	immutableFields,
	immutableFieldArray,
	validateField, 
	resetFields,
	transformFieldsToJSON,
	validateAllFields,
	validateAndMutateField
} from './utils';

export type FieldState = {
    value: any;
    isInvalid: boolean;
    isValidated: boolean;
    failedIn: string;
	message?: string | null;
	defaultValue?: any;
    [other: string]: any; 
}

export type FieldStateNested = Record<string, FieldState>

export type FormUpdateProp = {
    target: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | ({ value: any; name: string; files?: any[], selectedOptions?: any });
}

export type FormSchema = {
    label?: string;
    rules?: string;
	value?: any;
	defaultValue?: any;
}

export type FormRegistryProps = FormSchema & {
    name: string;
}

export type StatePropType = {
	submitted: boolean;
	dirty: boolean;
	fields: FieldStateNested | FieldStateNested[] | FieldState | FieldState[]
}

export const FormContext = createContext<ReturnType<typeof useForm>>({} as any);

export const useFormField = () => {
	return useContext(FormContext);
};

export const useGetValue = <P = any>(name: string, isArray: boolean = false): P => {
	const { fields } = useFormField()

	return useMemo(() => {
		return isArray
			? name in fields ? transformFieldsToJSON(fields[name]) : [] 
			: findOrCreateField(fields[name]).value
	}, [JSON.stringify(fields[name])])
};

export const useForm = (defaultSchema: Record<string, FormSchema> = {}) => {
	const defaultStates = useMemo<StatePropType>(() => ({
		submitted: false,
		dirty: false,
		fields: transformDefaultFields(defaultSchema)
	}), [])
	
	const [{submitted, dirty, fields}, setStates] = useState<StatePropType>(defaultStates);

	const formState = useCallback((name?: string): FieldState | FieldStateNested =>
		typeof name === 'string'
			? findOrCreateField(fields[name])
			: immutableFields(fields) 
	, [fields]);

	const formUpdate = useCallback(({ target }: FormUpdateProp) => {
		setStates((prev) => ({
			...prev,
			dirty: true,
			fields: validateField(prev.fields, target)
		}));
	}, []);

	const getValue = useCallback(<P = any>(name?: string, isArray: boolean = false): P  =>
		typeof name === 'string'
			? isArray 
				? name in fields ? transformFieldsToJSON(fields[name]) : [] 
				: findOrCreateField(fields[name]).value
			: transformFieldsToJSON(fields)
	, [fields]); 

	const getFieldArray = useCallback((name: string): Array<FieldState> | Array<FieldStateNested> => {
		return name in fields ? immutableFieldArray(fields[name]) : []
	}, [fields]); 

	const setFieldArray = useCallback((name: string, schema: FormSchema | Record<string, FormSchema>, chained: boolean = false) => {
		setStates((prev) => {
			const fieldsData = transformFieldsToJSON(prev.fields)
			return {
				...prev,
				fields: {
					...prev.fields,
					[name]: [
						...(prev.fields[name] || []), 
						chained ? (
							Object.keys(schema).reduce<FieldStateNested>((result, key) => {
								result[key] = prev.submitted ? (
									validateAndMutateField(findOrCreateField({label: key, ...schema[key]}), fieldsData)
								) : (
									findOrCreateField({label: key, ...schema[key]})
								)
								return result
							}, {})
						) : (
							prev.submitted ? (
								validateAndMutateField(findOrCreateField({label: name, ...schema}), fieldsData)
							) : (
								findOrCreateField({label: name, ...schema})
							)
						)
					]
				} as any
			}
		});
	}, []);

	const setFieldArrays = useCallback((name: string, schemas: FormSchema[] | Record<string, FormSchema>[], chained: boolean = false) => {
		setStates((prev) => {
			const fieldsData = transformFieldsToJSON(prev.fields)
			return {
				...prev,
				fields: {
					...prev.fields,
					[name]: [
						...(prev.fields[name] || []), 
						...((schemas as any).map((schema: any) => {
							return chained ? (
								Object.keys(schema).reduce<FieldStateNested>((result, key) => {
									result[key] = prev.submitted ? (
										validateAndMutateField(findOrCreateField({label: key, ...schema[key]}), fieldsData)
									) : (
										findOrCreateField({label: key, ...schema[key]})
									)
									return result
								}, {})
							) : (
								prev.submitted ? (
									validateAndMutateField(findOrCreateField({label: name, ...schema}), fieldsData)
								) : (
									findOrCreateField({label: name, ...schema})
								)
							)
						}))
					]
				} as any
			}
		});
	}, []);

	const removeFieldArray = useCallback((name: string, index?: number, except: boolean = false) => {
		setStates((prev) => {
			if(isNaN(index as any)) {
				delete prev.fields[name]
				return {
					...prev,
					fields: {
						...prev.fields
					}
				}
			} else {
				return {
					...prev,
					dirty: true,
					fields: {
						...prev.fields,
						[name]: prev.fields[name].filter((_: any, i: number) => except ? i === index : i !== index)
					}
				}
			}
		});
	}, []);

	const removeFieldArrays = useCallback((name: string, indexes: number[]) => {
		setStates((prev) => {
			return {
				...prev,
				dirty: true,
				fields: {
					...prev.fields,
					[name]: prev.fields[name].filter((_: any, i: number) => !indexes.includes(i))
				}
			}
		});
	}, []);

	const setFieldValues = useCallback((fieldValues: Record<string, any>) => {
		setStates((prev) => {

			const fields = Object.keys(fieldValues).reduce((result, name) => {
				const value = fieldValues[name]
				return validateField(result, { name, value })
			}, prev.fields)

			return {
				...prev,
				dirty: true,
				fields: fields
			}
		});
	}, []);

	const setFieldValue = useCallback((name: string, value: any) => {
		setStates((prev) => ({
			...prev,
			dirty: true,
			fields: validateField(prev.fields, { name, value })
		}));
	}, []);

	const setFieldErrors = useCallback((fieldErrors: Record<string, string>) => {
		setStates((prev) => {
			
			const fields = Object.keys(fieldErrors).reduce((result, name) => {
				const message = fieldErrors[name]
				return validateField(result, { name }, message)
			}, prev.fields)

			return {
				...prev,
				fields: fields
			}
		});
	}, []);

	const setFieldError = useCallback((name: string, message: string) => {
		setStates((prev) => ({
			...prev,
			fields: validateField(prev.fields, { name }, message)
		}));
	}, []);

	const clearFieldErrors = useCallback((names: string[]) => {
		setStates((prev) => {
			
			const fields = names.reduce((result, name) => {
				return validateField(result, { name }, null)
			}, prev.fields)

			return {
				...prev,
				fields: fields
			}
		});
	}, []);

	const clearFieldError = useCallback((name: string) => {
		setStates((prev) => ({
			...prev,
			fields: validateField(prev.fields, { name }, null)
		}));
	}, []);

	const setDirty = useCallback((dirty: boolean) => {
		setStates((prev) => ({ ...prev, dirty }))
	}, []);

	const resetForm = useCallback(() => {
		setStates(prev => ({
			...prev,
			submitted: false,
			dirty: false,
			fields: resetFields(prev.fields)
		}));
	}, [])

	const formSubmit = (onSubmit: ((event: FormEvent) => void)) => {
		return (event: any) => {
			if(event && event.preventDefault)
				event.preventDefault();
			const target = event && event.target;  
			const updatedFieldStates = validateAllFields(fields, transformFieldsToJSON(fields))
			
			setStates(prev => ({
				...prev,
				submitted: true,
				fields: updatedFieldStates
			}));

			const formevent = new FormEvent({
				target, 
				fieldStates: immutableFields(updatedFieldStates), 
				resetForm: () => {
					resetForm();
					if((target && 'document' in window) && target.reset) target.reset();
				},
				originalEvent: event,
				setFieldArray,
				removeFieldArray,
				setFieldError,
				setFieldValue,
				clearFieldError,
				setFieldArrays,
				removeFieldArrays,
				setFieldErrors,
				setFieldValues,
				clearFieldErrors,
				setDirty
			});

			typeof onSubmit === 'function' && onSubmit(formevent);
		};
	};

	const formRegistry = useCallback(({
		name,
		label,
		rules,
		value,
		defaultValue = ''
	}: FormRegistryProps) => {

		const field = findOrCreateField({
			label: label || name,
			rules,
			value: typeof value === 'undefined' ? defaultValue : value,
			defaultValue
		})
		
		setStates((prev) => {
			const fieldsData = transformFieldsToJSON(prev.fields)
			return { 
				...prev, 
				fields: { 
					...prev.fields, 
					[name]: prev.submitted ? (
						validateAndMutateField(field, fieldsData)
					) : (
						field
					) 
				} 
			};
		});

		return () => {
			setStates((prev) => {
				delete prev.fields[name];
				return { ...prev, fields: { ...prev.fields } };
			});
		};
	}, []);

	const fieldIsRegistered = (name: string) => {
		return name in fields
	}

	return {
		submitted,
		dirty,
		fields,
		formState,
		formUpdate,
		getValue,
		formSubmit,
		formRegistry,
		getFieldArray,
		setFieldArray,
		setFieldArrays,
		removeFieldArray,
		removeFieldArrays,
		setFieldValue,
		setFieldValues,
		setFieldError,
		setFieldErrors,
		clearFieldError,
		clearFieldErrors,
		setDirty,
		resetForm,
		fieldIsRegistered
	};
};