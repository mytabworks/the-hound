/// <reference types="react" />
export declare type FieldState = {
    value: any;
    isInvalid: boolean;
    isValidated: boolean;
    failedIn: string;
    message?: string | null;
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
    formState: (get?: string | undefined) => FieldState | FieldStateNested;
    formUpdate: ({ target }: FormUpdateProp) => void;
    formSubmit: (onSubmit: (event: any) => void) => (event: any) => void;
    formRegistry: ({ name, label, rules, value, }: FormRegistryProps) => () => void;
    getFieldArray: (name: string) => Array<FieldState> | Array<FieldStateNested>;
    setFieldArray: (name: string, schema: FormSchema | Record<string, FormSchema>, chained?: boolean) => void;
    removeFieldArray: (name: string, index?: number | undefined, except?: boolean) => void;
    setFieldValue: (name: string, value: any) => void;
    setFieldError: (name: string, message: string) => void;
    clearFieldError: (name: string) => void;
    setDirty: (dirty: boolean) => void;
}>;
export declare const useFormField: () => {
    submitted: boolean;
    dirty: boolean;
    formState: (get?: string | undefined) => FieldState | FieldStateNested;
    formUpdate: ({ target }: FormUpdateProp) => void;
    formSubmit: (onSubmit: (event: any) => void) => (event: any) => void;
    formRegistry: ({ name, label, rules, value, }: FormRegistryProps) => () => void;
    getFieldArray: (name: string) => Array<FieldState> | Array<FieldStateNested>;
    setFieldArray: (name: string, schema: FormSchema | Record<string, FormSchema>, chained?: boolean) => void;
    removeFieldArray: (name: string, index?: number | undefined, except?: boolean) => void;
    setFieldValue: (name: string, value: any) => void;
    setFieldError: (name: string, message: string) => void;
    clearFieldError: (name: string) => void;
    setDirty: (dirty: boolean) => void;
};
export declare const useForm: (defaultSchema?: Record<string, FormSchema>) => {
    submitted: boolean;
    dirty: boolean;
    formState: (get?: string | undefined) => FieldState | FieldStateNested;
    formUpdate: ({ target }: FormUpdateProp) => void;
    formSubmit: (onSubmit: (event: any) => void) => (event: any) => void;
    formRegistry: ({ name, label, rules, value, }: FormRegistryProps) => () => void;
    getFieldArray: (name: string) => Array<FieldState> | Array<FieldStateNested>;
    setFieldArray: (name: string, schema: FormSchema | Record<string, FormSchema>, chained?: boolean) => void;
    removeFieldArray: (name: string, index?: number | undefined, except?: boolean) => void;
    setFieldValue: (name: string, value: any) => void;
    setFieldError: (name: string, message: string) => void;
    clearFieldError: (name: string) => void;
    setDirty: (dirty: boolean) => void;
};
