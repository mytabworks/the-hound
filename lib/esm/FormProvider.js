import React from 'react';
import { FormContext } from './FormHooks';

const FormProvider = ({
  value,
  children
}) => {
  return /*#__PURE__*/React.createElement(FormContext.Provider, {
    value: value
  }, children);
};

export default FormProvider;