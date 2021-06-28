/// <reference types="react" />
import { FormSchema } from './FormHooks';
declare type SetFieldArray = (name: string, schema: FormSchema | Record<string, FormSchema>, multiple?: boolean) => void;
declare type RemoveFieldArray = (name: string, index?: number, except?: boolean) => void;
declare type SetFieldValue = (name: string, value: any) => void;
declare type SetFieldError = (name: string, errorMessage: string) => void;
declare type ClearFieldError = (name: string) => void;
export declare class FormEvent {
    target: any;
    fieldStates: Record<string, any>;
    resetForm: () => void;
    originalEvent?: React.SyntheticEvent<any>;
    setFieldArray: SetFieldArray;
    removeFieldArray: RemoveFieldArray;
    setFieldValue: SetFieldValue;
    setFieldError: SetFieldError;
    clearFieldError: ClearFieldError;
    constructor(props: any);
    locateFailed(correction?: number, autoscroll?: boolean): any;
    isReady(): boolean;
    forEach(callback: (...args: any[]) => void): void;
    json(): Record<string, any>;
    paramArray(): {
        name: string;
        value: any;
    }[];
    param(): string;
    formData(): FormData;
}
export {};
