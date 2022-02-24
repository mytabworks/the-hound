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
        dirty: true,
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
  const setFieldArrays = useCallback((name, schemas, chained = false) => {
    setStates(prev => {
      const fieldsData = transformFieldsToJSON(prev.fields);
      return { ...prev,
        fields: { ...prev.fields,
          [name]: [...(prev.fields[name] || []), ...schemas.map(schema => {
            return chained ? Object.keys(schema).reduce((result, key) => {
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
            });
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
          dirty: true,
          fields: { ...prev.fields,
            [name]: prev.fields[name].filter((_, i) => except ? i === index : i !== index)
          }
        };
      }
    });
  }, []);
  const removeFieldArrays = useCallback((name, indexes) => {
    setStates(prev => {
      return { ...prev,
        dirty: true,
        fields: { ...prev.fields,
          [name]: prev.fields[name].filter((_, i) => !indexes?.includes(i))
        }
      };
    });
  }, []);
  const setFieldValues = useCallback(fieldValues => {
    setStates(prev => {
      const fields = Object.keys(fieldValues).reduce((result, name) => {
        const value = fieldValues[name];
        return validateField(result, {
          name,
          value
        });
      }, prev.fields);
      return { ...prev,
        dirty: true,
        fields: fields
      };
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
  const setFieldErrors = useCallback(fieldErrors => {
    setStates(prev => {
      const fields = Object.keys(fieldErrors).reduce((result, name) => {
        const message = fieldErrors[name];
        return validateField(result, {
          name
        }, message);
      }, prev.fields);
      return { ...prev,
        fields: fields
      };
    });
  }, []);
  const setFieldError = useCallback((name, message) => {
    setStates(prev => ({ ...prev,
      fields: validateField(prev.fields, {
        name
      }, message)
    }));
  }, []);
  const clearFieldErrors = useCallback(names => {
    setStates(prev => {
      const fields = names.reduce((result, name) => {
        return validateField(result, {
          name
        }, null);
      }, prev.fields);
      return { ...prev,
        fields: fields
      };
    });
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
  const resetForm = useCallback(() => {
    setStates(prev => ({ ...prev,
      submitted: false,
      dirty: false,
      fields: resetFields(prev.fields)
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
      const formevent = new FormEvent({
        target,
        fieldStates: immutableFields(updatedFieldStates),
        resetForm: () => {
          resetForm();
          target && 'document' in window && target.reset();
        },
        originalEvent: event,
        setFieldArray,
        removeFieldArray,
        setFieldError,
        setFieldValue,
        clearFieldError,
        setDirty
      });
      typeof onSubmit === 'function' && onSubmit(formevent);
    };
  };

  const formRegistry = useCallback(({
    name,
    label,
    rules,
    value,
    defaultValue = ''
  }) => {
    const field = findOrCreateField({
      label: label || name,
      rules,
      value: typeof value === 'undefined' ? defaultValue : value,
      defaultValue
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

  const fieldIsRegistered = name => {
    return name in fields;
  };

  return {
    submitted,
    dirty,
    fields,
    formState,
    formUpdate,
    formSubmit,
    formRegistry,
    getFieldArray,
    setFieldArray,
    setFieldArrays,
    removeFieldArray,
    removeFieldArrays,
    setFieldValue,
    setFieldValues,
    setFieldError,
    setFieldErrors,
    clearFieldError,
    clearFieldErrors,
    setDirty,
    resetForm,
    fieldIsRegistered
  };
};