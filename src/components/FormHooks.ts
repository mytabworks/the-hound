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

export const useForm = (defaultSchema: Record<string, FormSchema> = {}) => {
	const defaultStates = useMemo<StatePropType>(() => ({
		submitted: false,
		dirty: false,
		fields: transformDefaultFields(defaultSchema)
	}), [])
	
	const [{submitted, dirty, fields}, setStates] = useState<StatePropType>(defaultStates);

	const formState = (get?: string): FieldState | FieldStateNested =>
		typeof get === 'string'
			? findOrCreateField(fields[get])
			: immutableFields(fields) 

	const formUpdate = useCallback(({ target }: FormUpdateProp) => {
		setStates((prev) => ({
			...prev,
			dirty: true,
			fields: validateField(prev.fields, target)
		}));
	}, []);

	const getFieldArray = (name: string): Array<FieldState> | Array<FieldStateNested> => {
		return name in fields ? immutableFieldArray(fields[name]) : []
	}

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

	const removeFieldArray = useCallback((name: string, index?: number, except: boolean = false) => {
		setStates((prev) => {
			if(isNaN(index as any)) {
				delete prev.fields[name]
				return {
					...prev,
					dirty: true,
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

	const setFieldValue = useCallback((name: string, value: any) => {
		setStates((prev) => ({
			...prev,
			dirty: true,
			fields: validateField(prev.fields, { name, value })
		}));
	}, []);

	const setFieldError = useCallback((name: string, message: string) => {
		setStates((prev) => ({
			...prev,
			fields: validateField(prev.fields, { name }, message)
		}));
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
			event.preventDefault();
			const target = event.target;  
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
					(target && 'document' in window) && target.reset();
				},
				originalEvent: event,
				setFieldArray,
				removeFieldArray,
				setFieldError,
				setFieldValue,
				clearFieldError
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

	return {
		submitted,
		dirty,
		formState,
		formUpdate,
		formSubmit,
		formRegistry,
		getFieldArray,
		setFieldArray,
		removeFieldArray,
		setFieldValue,
		setFieldError,
		clearFieldError,
		setDirty,
		resetForm
	};
};