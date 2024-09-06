import React from 'react'
import { FieldState, FormSchema } from './FormHooks';
import { transformFieldsToJSON, computeFieldWhenReady, getClosestScrolled, immutableFields } from './utils'

type SetFieldArray = (name: string, schema: FormSchema | Record<string, FormSchema>, multiple?: boolean) => void;

type RemoveFieldArray = (name: string, index?: number, except?: boolean) => void;

type SetFieldValue = (name: string, value: any) => void;

type SetFieldError = (name: string, errorMessage: string) => void;

type ClearFieldError = (name: string) => void;

type SetFieldArrays = (name: string, schema: FormSchema[] | Record<string, FormSchema>[], multiple?: boolean) => void;

type RemoveFieldArrays = (name: string, indexes: number[]) => void;

type SetFieldValues = (fieldValues: Record<string, any>) => void;

type SetFieldErrors = (fieldErrors: Record<string, string>) => void;

type ClearFieldErrors = (names: string[]) => void;

type SetDirty = (value: boolean) => void;

export class FormEvent {

	target: any;

	fieldStates!: Record<string, any>;

	resetForm!: () => void;

	originalEvent?: React.SyntheticEvent<any>;

	setFieldArray!: SetFieldArray;

	removeFieldArray!: RemoveFieldArray;
	
	setFieldValue!: SetFieldValue;
	
	setFieldError!: SetFieldError;
	
	clearFieldError!: ClearFieldError;

	setFieldArrays!: SetFieldArrays;
	
	removeFieldArrays!: RemoveFieldArrays;

	setFieldValues!: SetFieldValues;
	
	setFieldErrors!: SetFieldErrors;
	
	clearFieldErrors!: ClearFieldErrors;
	
    setDirty!: SetDirty;

	constructor(props: any) {
		Object.assign(this, props)
	}

	locateFailed(correction = 40, autoscroll = true) {
		const scrollableElement = getClosestScrolled(this.target || document.documentElement);
		const scrolledTop = scrollableElement.scrollTop;
		const lowestErrorTop = Object.keys(this.fieldStates).reduce(
			(result, current) => {
				if (!this.fieldStates[current].isInvalid) return result;
				const error = this.target.querySelector(
					`[name="${current}"]`
				);
				const currentTop = scrollableElement.scrollTop + ((error && error.getBoundingClientRect().top) || 0)

				return result ? Math.min(currentTop, result as any) : currentTop;
			},
			null
		);
		
		if (lowestErrorTop === scrolledTop) return scrolledTop;
		
		return autoscroll
			? scrollableElement.scrollTo({ top: lowestErrorTop - correction, left: 0, behavior: 'smooth'})
			: lowestErrorTop - correction;
	}

	erroredFieldStates() {
		const fieldStates = immutableFields(this.fieldStates) as Record<string, FieldState>;
		return Object.keys(fieldStates)
			.filter((key) => fieldStates[key].isInvalid)
			.reduce<Record<string, any>>((result, key) => {
				result[key] = fieldStates[key]
				return result
			}, {})
	}

	isReady() {
		return computeFieldWhenReady(this.fieldStates)
	}

	forEach(callback: (...args: any[]) => void) {
		const form = this.json();
		Object.keys(form).forEach((field) =>
			callback(form[field].value, field)
		);
	}

	json() {
		return transformFieldsToJSON(this.fieldStates);
	}

	paramArray() {
		const result: { name: string, value: any }[] = [];

		this.forEach((value, name) => result.push({ name, value }));

		return result;
	}

	param() {
		return this.paramArray()
			.reduce(
				(result, current) =>
					(result += Array.isArray(current.value)
						? current.value.reduce(
								(res, val) => (res += `&${current.name}=${val}`),
								''
						  )
						: `&${current.name}=${current.value}`),
				''
			)
			.substr(1);
	}

	formData() {
		return new FormData(this.target);
	}
}