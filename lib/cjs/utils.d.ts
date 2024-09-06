import { FieldState, StatePropType, FieldStateNested, FormSchema } from './FormHooks';
export declare const validateField: (fields: StatePropType["fields"], target: any, customMessage?: string | null | undefined) => Record<string, FieldState | Record<string, FieldState> | Record<string, FieldState>[] | FieldState[]>;
export declare const findOrCreateField: ({ defaultValue, ...state }?: FormSchema) => any;
export declare const immutableFields: (fields: StatePropType["fields"]) => {};
export declare const immutableFieldArray: (arrayFields: FieldState[] | FieldStateNested[]) => FieldState[] | FieldStateNested[];
export declare const resetFields: (fields: StatePropType["fields"]) => {};
export declare const transformDefaultFields: (fields: Record<string, FormSchema | FormSchema[]>) => StatePropType["fields"];
export declare const getChainedField: (name: string) => {
    index: undefined;
    field: string;
    subFields: string[];
};
export declare const validateAllFields: (fields: StatePropType["fields"], fieldsData: ReturnType<typeof transformFieldsToJSON>) => {};
export declare const transformFieldsToJSON: (fields: StatePropType["fields"]) => any;
export declare const validateAndMutateField: (currentField: FieldState, fieldsData: ReturnType<typeof transformFieldsToJSON>) => FieldState;
export declare const computeFieldWhenReady: (fields: StatePropType["fields"]) => boolean;
export declare const getClosestScrolled: (container: any) => any;
export declare const isFieldState: (item: any) => boolean;
