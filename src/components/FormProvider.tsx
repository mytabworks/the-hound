import React from 'react';
import { FormContext, useForm } from './FormHooks';

export type FormProviderProps = {
    children: React.ReactNode;
    value: ReturnType<typeof useForm>;
}

const FormProvider: React.FunctionComponent<FormProviderProps> = ({ value, children }) => {

	return (
		<FormContext.Provider value={value}>
			{children}
		</FormContext.Provider>
	)
};

export default FormProvider;
