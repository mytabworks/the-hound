import React from 'react';
import { useCreateStore } from './FormHooks';
export declare type FormProviderProps = {
    children: React.ReactNode;
    value: ReturnType<typeof useCreateStore>;
};
declare const FormProvider: React.FunctionComponent<FormProviderProps>;
export default FormProvider;
