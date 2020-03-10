import React from 'react'

declare module 'formydable';

export type FormStateProviderProps<V = any> = {
    children: React.ReactNode;
    value: V;
}

type FormStateProviderComponent<P = FormStateProviderProps> = React.FunctionComponent<P> 

export const FormStateProvider: FormStateProviderComponent

export type UseFormStateProps<P = any> = () => P

export const useFormState: UseFormStateProps

export type FormState = (name: string) => UseFormProps | UseFormRegistredProps

interface FormUpdateProp {
    target: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
}

export type FormUpdate = (props: FormUpdateProp, alias?: string) => void

export type FormRegistryProps = {
    name: string;
    label: string;
    rules: string;
}

export type FormRegistry = (props: FormRegistryProps) => void

export type FormSubmit = (props: (event: any) => void ) => void

export type UseFormRegistredProps = {
    label: string;
    rules: string;
    isInvalid?: boolean;
    message?: string | null;
}

export interface UseFormProps {
    [name: string]: UseFormRegistredProps;
}

export type UseFormType = (fields?: UseFormProps) => [FormState, FormUpdate, FormRegistry, FormSubmit]

export const useForm: UseFormType