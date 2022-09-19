"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.validateField = exports.validateAndMutateField = exports.validateAllFields = exports.transformFieldsToJSON = exports.transformDefaultFields = exports.resetFields = exports.isFieldState = exports.immutableFields = exports.immutableFieldArray = exports.getClosestScrolled = exports.getChainedField = exports.findOrCreateField = exports.computeFieldWhenReady = void 0;

var _validozer = _interopRequireDefault(require("validozer"));

var _excluded = ["defaultValue"],
    _excluded2 = ["defaultValue"];

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _toArray(arr) { return _arrayWithHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }

function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var validateField = function validateField(fields, target, customMessage) {
  var name = target.name,
      value = target.value,
      form = target.form,
      files = target.files,
      selectedOptions = target.selectedOptions,
      type = target.type;

  if (['checkbox', 'radio'].includes(type)) {
    value = Array.from(form.querySelectorAll("[name=\"".concat(name, "\"]"))).filter(function (element) {
      return element.checked;
    }).map(function (box) {
      return box.value;
    });

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

  var chained = getChainedField(name);
  var isArray = !isNaN(chained.index);
  var isChained = chained.subFields.length > 0;
  var currentField;

  if (isChained && fields[chained.field]) {
    currentField = chained.subFields.reduce(function (result, subField) {
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

  var updateField;

  if (customMessage === undefined) {
    // normal validation
    updateField = validateAndMutateField(_objectSpread(_objectSpread({}, currentField), {}, {
      value: value
    }), transformFieldsToJSON(fields));
  } else {
    // if customMessage is null we remove the error
    // but if it has a context we set an error
    var isNotNull = customMessage !== null;
    updateField = _objectSpread(_objectSpread({}, currentField), {}, {
      isValidated: isNotNull,
      isInvalid: isNotNull,
      message: customMessage
    });
  }

  return _objectSpread(_objectSpread({}, fields), {}, _defineProperty({}, isArray ? chained.field : name, isArray ? fields[chained.field].map(function (each, index) {
    return index === chained.index ? isChained ? updateChainedField(chained, updateField, _objectSpread({}, each)) : updateField : each;
  }) : updateField));
};

exports.validateField = validateField;

var findOrCreateField = function findOrCreateField() {
  var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
      _ref$defaultValue = _ref.defaultValue,
      defaultValue = _ref$defaultValue === void 0 ? '' : _ref$defaultValue,
      state = _objectWithoutProperties(_ref, _excluded);

  return _objectSpread({
    value: defaultValue,
    defaultValue: defaultValue,
    isInvalid: false,
    isValidated: false,
    message: null
  }, state);
};

exports.findOrCreateField = findOrCreateField;

var immutableFields = function immutableFields(fields) {
  return Object.keys(fields).reduce(function (result, name) {
    if (Array.isArray(fields[name])) {
      result[name] = fields[name].map(function (each) {
        return isFieldState(each) ? _objectSpread({}, each) : immutableFields(each);
      });
    } else {
      result[name] = _objectSpread({}, fields[name]);
    }

    return result;
  }, {});
};

exports.immutableFields = immutableFields;

var immutableFieldArray = function immutableFieldArray(arrayFields) {
  return arrayFields.map(function (each) {
    return isFieldState(each) ? _objectSpread({}, each) : immutableFields(each);
  });
};

exports.immutableFieldArray = immutableFieldArray;

var resetFields = function resetFields(fields) {
  return Object.keys(fields).reduce(function (result, name) {
    if (Array.isArray(fields[name])) {
      result[name] = fields[name].map(function (each) {
        return isFieldState(each) ? _objectSpread(_objectSpread({}, each), {}, {
          isInvalid: false,
          isValidated: false,
          message: null,
          value: each.defaultValue
        }) : resetFields(each);
      });
    } else {
      result[name] = _objectSpread(_objectSpread({}, fields[name]), {}, {
        isInvalid: false,
        isValidated: false,
        message: null,
        value: fields[name].defaultValue
      });
    }

    return result;
  }, {});
};

exports.resetFields = resetFields;

var transformFields = function transformFields(_ref2, label) {
  var _ref2$defaultValue = _ref2.defaultValue,
      defaultValue = _ref2$defaultValue === void 0 ? '' : _ref2$defaultValue,
      rawFields = _objectWithoutProperties(_ref2, _excluded2);

  return _objectSpread(_objectSpread({
    value: defaultValue,
    defaultValue: defaultValue,
    label: label
  }, rawFields), {}, {
    isInvalid: false,
    isValidated: false,
    message: null
  });
};

var transformDefaultFields = function transformDefaultFields(fields) {
  return Object.keys(fields).reduce(function (result, name) {
    if (Array.isArray(fields[name])) {
      result[name] = fields[name].map(function (each) {
        return 'rules' in each || 'label' in each ? transformFields(each, name) : transformDefaultFields(each);
      });
    } else {
      result[name] = transformFields(fields[name], name);
    }

    return result;
  }, {});
};

exports.transformDefaultFields = transformDefaultFields;

var getChainedField = function getChainedField(name) {
  var index;

  var _name$replace$split = name.replace(/\[(\d+)\]/, function (_, i) {
    index = parseInt(i);
    return "";
  }).split('.'),
      _name$replace$split2 = _toArray(_name$replace$split),
      field = _name$replace$split2[0],
      subFields = _name$replace$split2.slice(1);

  return {
    index: index,
    field: field,
    subFields: subFields
  };
};

exports.getChainedField = getChainedField;

var updateChainedField = function updateChainedField(chained, subFieldValue, rewrite) {
  return chained.subFields.reduce(function (result, subField, index, array) {
    var isLastIndex = array.length - 1 === index;

    if (isLastIndex) {
      result[subField] = subFieldValue;
      return rewrite;
    }

    return result[subField];
  }, rewrite);
};

var validateAllFields = function validateAllFields(fields, fieldsData) {
  return Object.keys(fields).reduce(function (result, key) {
    if (Array.isArray(fields[key])) {
      result[key] = fields[key].map(function (each) {
        return isFieldState(each) ? validateAndMutateField(_objectSpread({}, each), fieldsData) : validateAllFields(each, fieldsData);
      });
    } else {
      result[key] = validateAndMutateField(_objectSpread({}, fields[key]), fieldsData);
    }

    return result;
  }, {});
};

exports.validateAllFields = validateAllFields;

var transformFieldsToJSON = function transformFieldsToJSON(fields) {
  if (Array.isArray(fields)) {
    return fields.map(function (each) {
      return isFieldState(each) ? each.value : transformFieldsToJSON(each);
    });
  } else {
    return Object.keys(fields).reduce(function (result, key) {
      if (Array.isArray(fields[key])) {
        result[key] = fields[key].map(function (each) {
          return isFieldState(each) ? each.value : transformFieldsToJSON(each);
        });
      } else {
        result[key] = fields[key].value;
      }

      return result;
    }, {});
  }
};

exports.transformFieldsToJSON = transformFieldsToJSON;

var validateAndMutateField = function validateAndMutateField(currentField, fieldsData) {
  var label = currentField.label,
      rules = currentField.rules,
      value = currentField.value;

  if (rules) {
    Object.assign(currentField, _validozer["default"].validate(value, rules, label, fieldsData), {
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

exports.validateAndMutateField = validateAndMutateField;

var computeFieldWhenReady = function computeFieldWhenReady(fields) {
  return Object.keys(fields).every(function (name) {
    return Array.isArray(fields[name]) ? fields[name].every(function (each) {
      return isFieldState(each) ? !each.isInvalid : computeFieldWhenReady(each);
    }) : !fields[name].isInvalid;
  });
};

exports.computeFieldWhenReady = computeFieldWhenReady;

var getClosestScrolled = function getClosestScrolled(container) {
  var ancestors;

  for (var elem = container.parentNode; elem && !ancestors; elem = elem.parentNode) {
    if (elem.scrollHeight > elem.clientHeight || elem.scrollWidth > elem.clientWidth) {
      ancestors = elem;
    }
  }

  return ancestors || container;
};

exports.getClosestScrolled = getClosestScrolled;

var isFieldState = function isFieldState(item) {
  return 'isInvalid' in item && 'isValidated' in item;
};

exports.isFieldState = isFieldState;

var fieldNotExists = function fieldNotExists(name) {
  return new TypeError("field name `".concat(name, "` doesn't exists on the registered fields"));
};