import React from 'react';
import { useForm } from './FormHooks';
export declare type FormProviderProps = {
    children: React.ReactNode;
    value: ReturnType<typeof useForm>;
};
declare const FormProvider: React.FunctionComponent<FormProviderProps>;
export default FormProvider;
