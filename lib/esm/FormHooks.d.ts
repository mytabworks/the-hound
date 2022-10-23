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
    getState: () => StatePropType;
    setState: (fn: CB<StatePropType>) => void;
    subscribe: (listener: (state: StatePropType) => void) => () => void;
}>;
export declare const useFormField: () => {
    submitted: boolean;
    dirty: boolean;
    fields: FieldState | Record<string, FieldState> | Record<string, FieldState>[] | FieldState[];
    formState: (name?: string | undefined) => FieldState | FieldStateNested;
    getValue: <P = any>(name?: string | undefined, isFieldArray?: boolean) => P;
    getFieldArray: (name: string) => Array<FieldState> | Array<FieldStateNested>;
    fieldIsRegistered: (name: string) => boolean;
    formUpdate: ({ target }: FormUpdateProp) => void;
    formSubmit: (onSubmit: (event: FormEvent) => void) => (event: any) => void;
    formRegistry: ({ name, label, rules, value, defaultValue }: FormRegistryProps) => () => void;
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
};
export declare const useFormFieldWithSelector: (name: string, isFieldArray?: boolean) => {
    fieldState: FieldState | Record<string, FieldState> | Record<string, FieldState>[] | FieldState[];
    formUpdate: ({ target }: FormUpdateProp) => void;
    formSubmit: (onSubmit: (event: FormEvent) => void) => (event: any) => void;
    formRegistry: ({ name, label, rules, value, defaultValue }: FormRegistryProps) => () => void;
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
};
export declare const useGetValue: <P = any>(name: string, isFieldArray?: boolean) => P;
export declare const useFormSubmitted: (store?: {
    getState: () => StatePropType;
    setState: (fn: CB<StatePropType>) => void;
    subscribe: (listener: (state: StatePropType) => void) => () => void;
} | undefined) => boolean;
export declare const useFormDirty: (store?: {
    getState: () => StatePropType;
    setState: (fn: CB<StatePropType>) => void;
    subscribe: (listener: (state: StatePropType) => void) => () => void;
} | undefined) => boolean;
export declare const useFormSetMethods: (store?: {
    getState: () => StatePropType;
    setState: (fn: CB<StatePropType>) => void;
    subscribe: (listener: (state: StatePropType) => void) => () => void;
} | undefined) => {
    formUpdate: ({ target }: FormUpdateProp) => void;
    formSubmit: (onSubmit: (event: FormEvent) => void) => (event: any) => void;
    formRegistry: ({ name, label, rules, value, defaultValue }: FormRegistryProps) => () => void;
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
};
export declare const useFormWatchMethods: (store?: {
    getState: () => StatePropType;
    setState: (fn: CB<StatePropType>) => void;
    subscribe: (listener: (state: StatePropType) => void) => () => void;
} | undefined) => {
    submitted: boolean;
    dirty: boolean;
    fields: FieldState | Record<string, FieldState> | Record<string, FieldState>[] | FieldState[];
    formState: (name?: string | undefined) => FieldState | FieldStateNested;
    getValue: <P = any>(name?: string | undefined, isFieldArray?: boolean) => P;
    getFieldArray: (name: string) => Array<FieldState> | Array<FieldStateNested>;
    fieldIsRegistered: (name: string) => boolean;
};
declare type CB<P> = (prev: P) => P;
export declare const useVariable: <P = Record<string, any>>(content: P) => [() => P, (callback: P | CB<P>) => P];
export declare const useCreateStore: (defaultSchema?: Record<string, FormSchema>) => {
    getState: () => StatePropType;
    setState: (fn: CB<StatePropType>) => void;
    subscribe: (listener: (state: StatePropType) => void) => () => void;
};
export declare const useStore: <P = StatePropType>(store: ReturnType<typeof useCreateStore>, selector?: (state: StatePropType) => P) => P;
export declare const useForm: (defaultSchema?: Record<string, FormSchema>) => {
    submitted: boolean;
    dirty: boolean;
    fields: FieldState | Record<string, FieldState> | Record<string, FieldState>[] | FieldState[];
    formState: (name?: string | undefined) => FieldState | FieldStateNested;
    getValue: <P = any>(name?: string | undefined, isFieldArray?: boolean) => P;
    getFieldArray: (name: string) => Array<FieldState> | Array<FieldStateNested>;
    fieldIsRegistered: (name: string) => boolean;
    formUpdate: ({ target }: FormUpdateProp) => void;
    formSubmit: (onSubmit: (event: FormEvent) => void) => (event: any) => void;
    formRegistry: ({ name, label, rules, value, defaultValue }: FormRegistryProps) => () => void;
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
    store: {
        getState: () => StatePropType;
        setState: (fn: CB<StatePropType>) => void;
        subscribe: (listener: (state: StatePropType) => void) => () => void;
    };
};
export declare const useFormGenericWatchStateMethods: (store: ReturnType<typeof useCreateStore>) => {
    submitted: boolean;
    dirty: boolean;
    fields: FieldState | Record<string, FieldState> | Record<string, FieldState>[] | FieldState[];
    formState: (name?: string | undefined) => FieldState | FieldStateNested;
    getValue: <P = any>(name?: string | undefined, isFieldArray?: boolean) => P;
    getFieldArray: (name: string) => Array<FieldState> | Array<FieldStateNested>;
    fieldIsRegistered: (name: string) => boolean;
};
export declare const useFormGenericSetStateMethods: (store: ReturnType<typeof useCreateStore>) => {
    formUpdate: ({ target }: FormUpdateProp) => void;
    formSubmit: (onSubmit: (event: FormEvent) => void) => (event: any) => void;
    formRegistry: ({ name, label, rules, value, defaultValue }: FormRegistryProps) => () => void;
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
};
export {};
