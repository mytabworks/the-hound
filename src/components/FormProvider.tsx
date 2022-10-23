import React from 'react';
import { FormContext, useCreateStore } from './FormHooks';

export type FormProviderProps = {
    children: React.ReactNode;
    value: ReturnType<typeof useCreateStore>;
}

const FormProvider: React.FunctionComponent<FormProviderProps> = ({ value, children }) => {

	return (
		<FormContext.Provider value={value}>
			{children}
		</FormContext.Provider>
	)
};

export default FormProvider;
