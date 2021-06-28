import Validozer from 'validozer';
export const validateField = (fields, target, customMessage) => {
  let {
    name,
    value,
    form,
    files,
    selectedOptions,
    type
  } = target;

  if (['checkbox', 'radio'].includes(type)) {
    value = Array.from(form.querySelectorAll(`[name="${name}"]`)).filter(element => element.checked).map(box => box.value);

    if (type === 'radio') {
      value = value[0];
    }
  }

  if (files) {
    value = files;
  }

  if (selectedOptions && target.multiple) {
    value = Array.from(selectedOptions);
  }

  const chained = getChainedField(name);
  const isArray = !isNaN(chained.index);
  const isChained = chained.subFields.length > 0;
  let currentField;

  if (isChained && fields[chained.field]) {
    currentField = chained.subFields.reduce((result, subField) => {
      return result[subField];
    }, isArray ? fields[chained.field][chained.index] : fields[chained.field]);
  } else if (isArray && fields[chained.field]) {
    currentField = fields[chained.field][chained.index];
  } else {
    currentField = fields[name];
  }

  if (!currentField) {
    console.error(fieldNotExists(name));
    return fields;
  }

  let updateField;

  if (customMessage === undefined) {
    // normal validation
    updateField = validateAndMutateField({ ...currentField,
      value
    }, transformFieldsToJSON(fields));
  } else {
    // if customMessage is null we remove the error
    // but if it has a context we set an error
    const isNotNull = customMessage !== null;
    updateField = { ...currentField,
      isValidated: isNotNull,
      isInvalid: isNotNull,
      message: customMessage
    };
  }

  return { ...fields,
    [isArray ? chained.field : name]: isArray ? fields[chained.field].map((each, index) => index === chained.index ? isChained ? updateChainedField(chained, updateField, { ...each
    }) : updateField : each) : updateField
  };
};
export const findOrCreateField = (state = {}) => ({
  value: '',
  isInvalid: false,
  isValidated: false,
  message: null,
  ...state
});
export const immutableFields = fields => Object.keys(fields).reduce((result, name) => {
  if (Array.isArray(fields[name])) {
    result[name] = fields[name].map(each => {
      return isFieldState(each) ? { ...each
      } : immutableFields(each);
    });
  } else {
    result[name] = { ...fields[name]
    };
  }

  return result;
}, {});
export const immutableFieldArray = arrayFields => arrayFields.map(each => {
  return isFieldState(each) ? { ...each
  } : immutableFields(each);
});
export const resetFields = fields => Object.keys(fields).reduce((result, name) => {
  if (Array.isArray(fields[name])) {
    result[name] = fields[name].map(each => {
      return isFieldState(each) ? { ...each,
        isInvalid: false,
        isValidated: false,
        message: null,
        value: each.defaultValue
      } : resetFields(each);
    });
  } else {
    result[name] = { ...fields[name],
      isInvalid: false,
      isValidated: false,
      message: null,
      value: fields[name].defaultValue
    };
  }

  return result;
}, {});

const transformFields = ({
  defaultValue = '',
  ...rawFields
}, label) => {
  return {
    value: defaultValue,
    defaultValue,
    label,
    ...rawFields,
    isInvalid: false,
    isValidated: false,
    message: null
  };
};

export const transformDefaultFields = fields => Object.keys(fields).reduce((result, name) => {
  if (Array.isArray(fields[name])) {
    result[name] = fields[name].map(each => {
      return 'rules' in each || 'label' in each ? transformFields(each, name) : transformDefaultFields(each);
    });
  } else {
    result[name] = transformFields(fields[name], name);
  }

  return result;
}, {});
export const getChainedField = name => {
  let index;
  const [field, ...subFields] = name.replace(/\[(\d)\]/, (_, i) => {
    index = parseInt(i);
    return "";
  }).split('.');
  return {
    index,
    field,
    subFields
  };
};

const updateChainedField = (chained, subFieldValue, rewrite) => chained.subFields.reduce((result, subField, index, array) => {
  const isLastIndex = array.length - 1 === index;

  if (isLastIndex) {
    result[subField] = subFieldValue;
    return rewrite;
  }

  return result[subField];
}, rewrite);

export const validateAllFields = (fields, fieldsData) => {
  return Object.keys(fields).reduce((result, key) => {
    if (Array.isArray(fields[key])) {
      result[key] = fields[key].map(each => {
        return isFieldState(each) ? validateAndMutateField({ ...each
        }, fieldsData) : validateAllFields(each, fieldsData);
      });
    } else {
      result[key] = validateAndMutateField({ ...fields[key]
      }, fieldsData);
    }

    return result;
  }, {});
};
export const transformFieldsToJSON = fields => {
  return Object.keys(fields).reduce((result, key) => {
    if (Array.isArray(fields[key])) {
      result[key] = fields[key].map(each => {
        return isFieldState(each) ? each.value : transformFieldsToJSON(each);
      });
    } else {
      result[key] = fields[key].value;
    }

    return result;
  }, {});
};
export const validateAndMutateField = (currentField, fieldsData) => {
  const {
    label,
    rules,
    value
  } = currentField;

  if (rules) {
    Object.assign(currentField, Validozer.validate(value, rules, label, fieldsData), {
      isValidated: true
    });
  } else {
    Object.assign(currentField, {
      isValidated: true,
      isInvalid: false
    });
  }

  return currentField;
};
export const computeFieldWhenReady = fields => {
  return Object.keys(fields).every(name => {
    return Array.isArray(fields[name]) ? fields[name].every(each => {
      return isFieldState(each) ? !each.isInvalid : computeFieldWhenReady(each);
    }) : !fields[name].isInvalid;
  });
};
export const getClosestScrolled = container => {
  let ancestors;

  for (let elem = container.parentNode; elem && !ancestors; elem = elem.parentNode) {
    if (elem.scrollHeight > elem.clientHeight || elem.scrollWidth > elem.clientWidth) {
      ancestors = elem;
    }
  }

  return ancestors || container;
};
export const isFieldState = item => 'isInvalid' in item && 'isValidated' in item;

const fieldNotExists = name => {
  return new TypeError(`field name \`${name}\` doesn't exists on the registered fields`);
};