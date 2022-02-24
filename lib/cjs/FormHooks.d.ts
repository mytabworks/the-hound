/// <reference types="react" />
import { FormEvent } from './FormEvent';
export declare type FieldState = {
    value: any;
    isInvalid: boolean;
    isValidated: boolean;
    failedIn: string;
    message?: string | null;
    defaultValue?: any;
    [other: string]: any;
};
export declare type FieldStateNested = Record<string, FieldState>;
export declare type FormUpdateProp = {
    target: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | ({
        value: any;
        name: string;
        files?: any[];
        selectedOptions?: any;
    });
};
export declare type FormSchema = {
    label?: string;
    rules?: string;
    value?: any;
    defaultValue?: any;
};
export declare type FormRegistryProps = FormSchema & {
    name: string;
};
export declare type StatePropType = {
    submitted: boolean;
    dirty: boolean;
    fields: FieldStateNested | FieldStateNested[] | FieldState | FieldState[];
};
export declare const FormContext: import("react").Context<{
    submitted: boolean;
    dirty: boolean;
    fields: FieldState | Record<string, FieldState> | Record<string, FieldState>[] | FieldState[];
    formState: (get?: string | undefined) => FieldState | FieldStateNested;
    formUpdate: ({ target }: FormUpdateProp) => void;
    formSubmit: (onSubmit: (event: FormEvent) => void) => (event: any) => void;
    formRegistry: ({ name, label, rules, value, defaultValue }: FormRegistryProps) => () => void;
    getFieldArray: (name: string) => Array<FieldState> | Array<FieldStateNested>;
    setFieldArray: (name: string, schema: FormSchema | Record<string, FormSchema>, chained?: boolean) => void;
    setFieldArrays: (name: string, schemas: FormSchema[] | Record<string, FormSchema>[], chained?: boolean) => void;
    removeFieldArray: (name: string, index?: number | undefined, except?: boolean) => void;
    removeFieldArrays: (name: string, indexes: number[]) => void;
    setFieldValue: (name: string, value: any) => void;
    setFieldValues: (fieldValues: Record<string, any>) => void;
    setFieldError: (name: string, message: string) => void;
    setFieldErrors: (fieldErrors: Record<string, string>) => void;
    clearFieldError: (name: string) => void;
    clearFieldErrors: (names: string[]) => void;
    setDirty: (dirty: boolean) => void;
    resetForm: () => void;
    fieldIsRegistered: (name: string) => boolean;
}>;
export declare const useFormField: () => {
    submitted: boolean;
    dirty: boolean;
    fields: FieldState | Record<string, FieldState> | Record<string, FieldState>[] | FieldState[];
    formState: (get?: string | undefined) => FieldState | FieldStateNested;
    formUpdate: ({ target }: FormUpdateProp) => void;
    formSubmit: (onSubmit: (event: FormEvent) => void) => (event: any) => void;
    formRegistry: ({ name, label, rules, value, defaultValue }: FormRegistryProps) => () => void;
    getFieldArray: (name: string) => Array<FieldState> | Array<FieldStateNested>;
    setFieldArray: (name: string, schema: FormSchema | Record<string, FormSchema>, chained?: boolean) => void;
    setFieldArrays: (name: string, schemas: FormSchema[] | Record<string, FormSchema>[], chained?: boolean) => void;
    removeFieldArray: (name: string, index?: number | undefined, except?: boolean) => void;
    removeFieldArrays: (name: string, indexes: number[]) => void;
    setFieldValue: (name: string, value: any) => void;
    setFieldValues: (fieldValues: Record<string, any>) => void;
    setFieldError: (name: string, message: string) => void;
    setFieldErrors: (fieldErrors: Record<string, string>) => void;
    clearFieldError: (name: string) => void;
    clearFieldErrors: (names: string[]) => void;
    setDirty: (dirty: boolean) => void;
    resetForm: () => void;
    fieldIsRegistered: (name: string) => boolean;
};
export declare const useForm: (defaultSchema?: Record<string, FormSchema>) => {
    submitted: boolean;
    dirty: boolean;
    fields: FieldState | Record<string, FieldState> | Record<string, FieldState>[] | FieldState[];
    formState: (get?: string | undefined) => FieldState | FieldStateNested;
    formUpdate: ({ target }: FormUpdateProp) => void;
    formSubmit: (onSubmit: (event: FormEvent) => void) => (event: any) => void;
    formRegistry: ({ name, label, rules, value, defaultValue }: FormRegistryProps) => () => void;
    getFieldArray: (name: string) => Array<FieldState> | Array<FieldStateNested>;
    setFieldArray: (name: string, schema: FormSchema | Record<string, FormSchema>, chained?: boolean) => void;
    setFieldArrays: (name: string, schemas: FormSchema[] | Record<string, FormSchema>[], chained?: boolean) => void;
    removeFieldArray: (name: string, index?: number | undefined, except?: boolean) => void;
    removeFieldArrays: (name: string, indexes: number[]) => void;
    setFieldValue: (name: string, value: any) => void;
    setFieldValues: (fieldValues: Record<string, any>) => void;
    setFieldError: (name: string, message: string) => void;
    setFieldErrors: (fieldErrors: Record<string, string>) => void;
    clearFieldError: (name: string) => void;
    clearFieldErrors: (names: string[]) => void;
    setDirty: (dirty: boolean) => void;
    resetForm: () => void;
    fieldIsRegistered: (name: string) => boolean;
};
