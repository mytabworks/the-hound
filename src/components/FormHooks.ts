import { useState, useContext, createContext, useCallback, useMemo, useRef, useEffect, useLayoutEffect } from 'react';
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
	fields: Record<string, FieldStateNested | FieldStateNested[] | FieldState | FieldState[]>
}

export const FormContext = createContext<ReturnType<typeof useCreateStore>>(null as any);

export const useFormField = () => {
	const store = useContext(FormContext)
	const formMethods = useFormGenericSetStateMethods(store);
	const formGenericWatchMethods = useFormGenericWatchStateMethods(store)
	return {
		...formMethods,
		...formGenericWatchMethods
	}
};

export const useFormFieldWithSelector = <T extends true | false = false>(name: string, isFieldArray: T = false as T, defaultValue: any = '') => {
	const store = useContext(FormContext);

	const stateFromStore = useStore(store, (states) => states.fields[name])

	const fieldState = useMemo(() => {
		return isFieldArray
			? stateFromStore ? immutableFieldArray(stateFromStore as FieldStateNested[]) : [] 
			: findOrCreateField((stateFromStore || {defaultValue}) as FieldState)
	}, [stateFromStore]) as T extends false ? FieldState : FieldStateNested[]

	const formMethods = useFormGenericSetStateMethods(store);

	return {
		...formMethods,
		fieldState
	}
};

export const useGetValue = <T = any>(name: string, isFieldArray: boolean = false): T => {
	const store = useContext(FormContext);

	const state = useStore(store, (states) => states.fields[name], true)

	return useMemo(() => {
		return isFieldArray
			? state ? transformFieldsToJSON(state as FieldStateNested) : [] 
			: findOrCreateField(state as FieldState).value
	}, [state])
};

export const useGetAllValue = <T = Record<string, any>>(): T => {
	const store = useContext(FormContext);

	const state = useStore(store, (states) => states.fields, true)

	return useMemo(() => {
		return transformFieldsToJSON(state)
	}, [state])
}

export const useFormSubmitted = (store?: ReturnType<typeof useCreateStore>) => {
	const context = useContext(FormContext);
	return useStore(store || context, (states) => states.submitted, true)
}

export const useFormDirty = (store?: ReturnType<typeof useCreateStore>) => {
	const context = useContext(FormContext);
	return useStore(store || context, (states) => states.dirty, true)
}

export const useFormSetMethods = (store?: ReturnType<typeof useCreateStore>) => {
	const context = useContext(FormContext);
	return useFormGenericSetStateMethods(store || context)
};

export const useFormWatchMethods = (store?: ReturnType<typeof useCreateStore>) => {
	const context = useContext(FormContext);
	return useFormGenericWatchStateMethods(store || context)
};

type CB<P> = (prev: P) => P

export const useVariable = <P = Record<string, any>>(content: P): [() => P, ((callback: P | CB<P>) => P)] => {
    const variable = useRef({content})

    return useMemo(() => {
        return [
            () => variable.current.content, 
            (callback: P | CB<P>) => {
                return variable.current.content = typeof callback === 'function' ? (callback as CB<P>)(variable.current.content) : callback
			}
        ]
    }, [variable.current])
}

export const useCreateStore = (defaultSchema: Record<string, FormSchema> = {}) => {
	const initialState = useMemo<StatePropType>(() => ({
		submitted: false,
		dirty: false,
		fields: transformDefaultFields(defaultSchema)
	}), [])

	const [currentState, setSilentState] = useVariable<StatePropType>(initialState);

    const getState = () => currentState();

    const listeners = useRef(new Set<(state: StatePropType) => void>())

    const setState = (fn: CB<StatePropType>) => {

        const newState = setSilentState(fn)
        
        listeners.current.forEach((listener) => listener(newState))
    }

    const subscribe = (listener: (state: StatePropType) => void) => {
        
        listeners.current.add(listener)

        return () => {
			listeners.current.delete(listener)
		}
    }

    return {
        getState, 
        setState,
        subscribe
    }
}

export const useStore = <P = StatePropType>(store: ReturnType<typeof useCreateStore>, selector: (state: StatePropType) => P = ((state) => state as any), layoutEffect: boolean = false): P => {
	const [state, setState] = useState(selector(store.getState()))
	//@ts-ignore
	useEffect(() => {
		if(layoutEffect === false) {
			return store.subscribe((currenctStates) => {
				setState(selector(currenctStates))
			})
		}
	}, [])
	//@ts-ignore
	useLayoutEffect(() => {
		if(layoutEffect === true) {
			return store.subscribe((currenctStates) => {
				setState(selector(currenctStates))
			})
		}
	}, [])

	return state
}

export const useForm = (defaultSchema: Record<string, FormSchema> = {}) => {
	
	const store = useCreateStore(defaultSchema)

	const formMethods = useFormGenericSetStateMethods(store)

	const formGenericWatchMethods = useFormGenericWatchStateMethods(store)

	return {
		store,
		...formMethods,
		...formGenericWatchMethods
	}
};

export const useFormGenericWatchStateMethods = (store: ReturnType<typeof useCreateStore>) => {

	const {submitted, dirty, fields} = useStore(store)

	const formState = useCallback(<T extends string | undefined = undefined>(name?: T): T extends string ? FieldState : FieldStateNested =>
		typeof name === 'string'
			? findOrCreateField(fields[name!] as FieldState)
			: immutableFields(fields) 
	, [fields]);

	const getValue = useCallback(<T extends true | false = false>(name?: string, isFieldArray: T = false as T): T extends false ? FieldState : FieldStateNested[]  =>
		typeof name === 'string'
			? isFieldArray 
				? name in fields ? transformFieldsToJSON(fields[name] as FieldStateNested) : [] 
				: findOrCreateField(fields[name] as FieldState).value
			: transformFieldsToJSON(fields)
	, [fields]); 

	const getFieldArray = useCallback((name: string): Array<FieldState> | Array<FieldStateNested> => {
		return name in fields ? immutableFieldArray(fields[name] as FieldStateNested[]) : []
	}, [fields]);
	
	const fieldIsRegistered = (name: string) => {
		return name in fields
	}

	return {
		submitted, 
		dirty,
		fields,
		formState,
		getValue,
		getFieldArray,
		fieldIsRegistered
	}
}

export const useFormGenericSetStateMethods = (store: ReturnType<typeof useCreateStore>) => {

	const formUpdate = useCallback(({ target }: FormUpdateProp) => {
		store.setState((prev) => ({
			...prev,
			dirty: true,
			fields: validateField(prev.fields, target)
		}));
	}, []);

	const setFieldArray = useCallback((name: string, schema: FormSchema | Record<string, FormSchema>, chained: boolean = false) => {
		store.setState((prev) => {
			const fieldsData = transformFieldsToJSON(prev.fields)
			return {
				...prev,
				fields: {
					...prev.fields,
					[name]: [
						...(prev.fields[name] || []) as FieldStateNested[], 
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
		store.setState((prev) => {
			const fieldsData = transformFieldsToJSON(prev.fields)
			return {
				...prev,
				fields: {
					...prev.fields,
					[name]: [
						...(prev.fields[name] || []) as FieldStateNested[], 
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
		store.setState((prev) => {
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
		store.setState((prev) => {
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
		store.setState((prev) => {

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
		store.setState((prev) => ({
			...prev,
			dirty: true,
			fields: validateField(prev.fields, { name, value })
		}));
	}, []);

	const setSafeFieldValues = useCallback((fieldValues: Record<string, any>) => {
		store.setState((prev) => {

			const fields = Object.keys(fieldValues).reduce((result, name) => {
				const value = fieldValues[name]
				return validateField(result, { name, value })
			}, prev.fields)

			return {
				...prev,
				fields: fields
			}
		});
	}, []);

	const setSafeFieldValue = useCallback((name: string, value: any) => {
		store.setState((prev) => ({
			...prev,
			fields: validateField(prev.fields, { name, value })
		}));
	}, []);

	const setFieldErrors = useCallback((fieldErrors: Record<string, string>) => {
		store.setState((prev) => {
			
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
		store.setState((prev) => ({
			...prev,
			fields: validateField(prev.fields, { name }, message)
		}));
	}, []);

	const clearFieldErrors = useCallback((names: string[]) => {
		store.setState((prev) => {
			
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
		store.setState((prev) => ({
			...prev,
			fields: validateField(prev.fields, { name }, null)
		}));
	}, []);

	const setDirty = useCallback((dirty: boolean) => {
		store.setState((prev) => ({ ...prev, dirty }))
	}, []);

	const resetForm = useCallback(() => {
		store.setState(prev => ({
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
			const updatedFieldStates = validateAllFields(store.getState().fields, transformFieldsToJSON(store.getState().fields))
			
			store.setState(prev => ({
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
		
		store.setState((prev) => {
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
			store.setState((prev) => {
				delete prev.fields[name];
				return { ...prev, fields: { ...prev.fields } };
			});
		};
	}, []);
	
	return {
		formUpdate,
		formSubmit,
		formRegistry,
		setFieldArray,
		setFieldArrays,
		removeFieldArray,
		removeFieldArrays,
		setFieldValue,
		setFieldValues,
		setSafeFieldValues,
		setSafeFieldValue,
		setFieldError,
		setFieldErrors,
		clearFieldError,
		clearFieldErrors,
		setDirty,
		resetForm
	};
}