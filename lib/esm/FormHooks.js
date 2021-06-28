import { useState, useContext, createContext, useCallback, useMemo } from 'react';
import { FormEvent } from './FormEvent';
import { transformDefaultFields, findOrCreateField, immutableFields, immutableFieldArray, validateField, resetFields, transformFieldsToJSON, validateAllFields, validateAndMutateField } from './utils';
export const FormContext = /*#__PURE__*/createContext({});
export const useFormField = () => {
  return useContext(FormContext);
};
export const useForm = (defaultSchema = {}) => {
  const defaultStates = useMemo(() => ({
    submitted: false,
    dirty: false,
    fields: transformDefaultFields(defaultSchema)
  }), []);
  const [{
    submitted,
    dirty,
    fields
  }, setStates] = useState(defaultStates);

  const formState = get => typeof get === 'string' ? findOrCreateField(fields[get]) : immutableFields(fields);

  const formUpdate = useCallback(({
    target
  }) => {
    setStates(prev => ({ ...prev,
      dirty: true,
      fields: validateField(prev.fields, target)
    }));
  }, []);

  const getFieldArray = name => {
    return name in fields ? immutableFieldArray(fields[name]) : [];
  };

  const setFieldArray = useCallback((name, schema, chained = false) => {
    setStates(prev => {
      const fieldsData = transformFieldsToJSON(prev.fields);
      return { ...prev,
        fields: { ...prev.fields,
          [name]: [...(prev.fields[name] || []), chained ? Object.keys(schema).reduce((result, key) => {
            result[key] = prev.submitted ? validateAndMutateField(findOrCreateField({
              label: key,
              ...schema[key]
            }), fieldsData) : findOrCreateField({
              label: key,
              ...schema[key]
            });
            return result;
          }, {}) : prev.submitted ? validateAndMutateField(findOrCreateField({
            label: name,
            ...schema
          }), fieldsData) : findOrCreateField({
            label: name,
            ...schema
          })]
        }
      };
    });
  }, []);
  const removeFieldArray = useCallback((name, index, except = false) => {
    setStates(prev => {
      if (isNaN(index)) {
        delete prev.fields[name];
        return { ...prev,
          fields: { ...prev.fields
          }
        };
      } else {
        return { ...prev,
          fields: { ...prev.fields,
            [name]: prev.fields[name].filter((_, i) => except ? i === index : i !== index)
          }
        };
      }
    });
  }, []);
  const setFieldValue = useCallback((name, value) => {
    setStates(prev => ({ ...prev,
      dirty: true,
      fields: validateField(prev.fields, {
        name,
        value
      })
    }));
  }, []);
  const setFieldError = useCallback((name, message) => {
    setStates(prev => ({ ...prev,
      fields: validateField(prev.fields, {
        name
      }, message)
    }));
  }, []);
  const clearFieldError = useCallback(name => {
    setStates(prev => ({ ...prev,
      fields: validateField(prev.fields, {
        name
      }, null)
    }));
  }, []);
  const setDirty = useCallback(dirty => {
    setStates(prev => ({ ...prev,
      dirty
    }));
  }, []);

  const formSubmit = onSubmit => {
    return event => {
      event.preventDefault();
      const target = event.target;
      const updatedFieldStates = validateAllFields(fields, transformFieldsToJSON(fields));
      setStates(prev => ({ ...prev,
        submitted: true,
        fields: updatedFieldStates
      }));

      const reset = () => {
        setStates(prev => ({ ...prev,
          submitted: false,
          dirty: false,
          fields: resetFields(prev.fields)
        }));
        target && 'document' in window && target.reset();
      };

      const formevent = new FormEvent({
        target,
        fieldStates: immutableFields(updatedFieldStates),
        reset,
        originalEvent: event,
        setFieldArray,
        removeFieldArray,
        setFieldError,
        setFieldValue,
        clearFieldError
      });
      typeof onSubmit === 'function' && onSubmit(formevent);
    };
  };

  const formRegistry = useCallback(({
    name,
    label,
    rules,
    value = ''
  }) => {
    const field = findOrCreateField({
      label: label || name,
      rules,
      value
    });
    setStates(prev => {
      const fieldsData = transformFieldsToJSON(prev.fields);
      return { ...prev,
        fields: { ...prev.fields,
          [name]: prev.submitted ? validateAndMutateField(field, fieldsData) : field
        }
      };
    });
    return () => {
      setStates(prev => {
        delete prev.fields[name];
        return { ...prev,
          fields: { ...prev.fields
          }
        };
      });
    };
  }, []);
  return {
    submitted,
    dirty,
    formState,
    formUpdate,
    formSubmit,
    formRegistry,
    getFieldArray,
    setFieldArray,
    removeFieldArray,
    setFieldValue,
    setFieldError,
    clearFieldError,
    setDirty
  };
};