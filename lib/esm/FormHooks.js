"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.useGetValue = exports.useFormField = exports.useForm = exports.FormContext = void 0;

var _react = require("react");

var _FormEvent = require("./FormEvent");

var _utils = require("./utils");

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _iterableToArrayLimit(arr, i) { var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"]; if (_i == null) return; var _arr = []; var _n = true; var _d = false; var _s, _e; try { for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

var FormContext = /*#__PURE__*/(0, _react.createContext)({});
exports.FormContext = FormContext;

var useFormField = function useFormField() {
  return (0, _react.useContext)(FormContext);
};

exports.useFormField = useFormField;

var useGetValue = function useGetValue(name) {
  var isFieldArray = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

  var _useFormField = useFormField(),
      fields = _useFormField.fields;

  return (0, _react.useMemo)(function () {
    return isFieldArray ? name in fields ? (0, _utils.transformFieldsToJSON)(fields[name]) : [] : (0, _utils.findOrCreateField)(fields[name]).value;
  }, [JSON.stringify(fields[name])]);
};

exports.useGetValue = useGetValue;

var useForm = function useForm() {
  var defaultSchema = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var defaultStates = (0, _react.useMemo)(function () {
    return {
      submitted: false,
      dirty: false,
      fields: (0, _utils.transformDefaultFields)(defaultSchema)
    };
  }, []);

  var _useState = (0, _react.useState)(defaultStates),
      _useState2 = _slicedToArray(_useState, 2),
      _useState2$ = _useState2[0],
      submitted = _useState2$.submitted,
      dirty = _useState2$.dirty,
      fields = _useState2$.fields,
      setStates = _useState2[1];

  var formState = (0, _react.useCallback)(function (name) {
    return typeof name === 'string' ? (0, _utils.findOrCreateField)(fields[name]) : (0, _utils.immutableFields)(fields);
  }, [fields]);
  var formUpdate = (0, _react.useCallback)(function (_ref) {
    var target = _ref.target;
    setStates(function (prev) {
      return _objectSpread(_objectSpread({}, prev), {}, {
        dirty: true,
        fields: (0, _utils.validateField)(prev.fields, target)
      });
    });
  }, []);
  var getValue = (0, _react.useCallback)(function (name) {
    var isFieldArray = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
    return typeof name === 'string' ? isFieldArray ? name in fields ? (0, _utils.transformFieldsToJSON)(fields[name]) : [] : (0, _utils.findOrCreateField)(fields[name]).value : (0, _utils.transformFieldsToJSON)(fields);
  }, [fields]);
  var getFieldArray = (0, _react.useCallback)(function (name) {
    return name in fields ? (0, _utils.immutableFieldArray)(fields[name]) : [];
  }, [fields]);
  var setFieldArray = (0, _react.useCallback)(function (name, schema) {
    var chained = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
    setStates(function (prev) {
      var fieldsData = (0, _utils.transformFieldsToJSON)(prev.fields);
      return _objectSpread(_objectSpread({}, prev), {}, {
        fields: _objectSpread(_objectSpread({}, prev.fields), {}, _defineProperty({}, name, [].concat(_toConsumableArray(prev.fields[name] || []), [chained ? Object.keys(schema).reduce(function (result, key) {
          result[key] = prev.submitted ? (0, _utils.validateAndMutateField)((0, _utils.findOrCreateField)(_objectSpread({
            label: key
          }, schema[key])), fieldsData) : (0, _utils.findOrCreateField)(_objectSpread({
            label: key
          }, schema[key]));
          return result;
        }, {}) : prev.submitted ? (0, _utils.validateAndMutateField)((0, _utils.findOrCreateField)(_objectSpread({
          label: name
        }, schema)), fieldsData) : (0, _utils.findOrCreateField)(_objectSpread({
          label: name
        }, schema))])))
      });
    });
  }, []);
  var setFieldArrays = (0, _react.useCallback)(function (name, schemas) {
    var chained = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
    setStates(function (prev) {
      var fieldsData = (0, _utils.transformFieldsToJSON)(prev.fields);
      return _objectSpread(_objectSpread({}, prev), {}, {
        fields: _objectSpread(_objectSpread({}, prev.fields), {}, _defineProperty({}, name, [].concat(_toConsumableArray(prev.fields[name] || []), _toConsumableArray(schemas.map(function (schema) {
          return chained ? Object.keys(schema).reduce(function (result, key) {
            result[key] = prev.submitted ? (0, _utils.validateAndMutateField)((0, _utils.findOrCreateField)(_objectSpread({
              label: key
            }, schema[key])), fieldsData) : (0, _utils.findOrCreateField)(_objectSpread({
              label: key
            }, schema[key]));
            return result;
          }, {}) : prev.submitted ? (0, _utils.validateAndMutateField)((0, _utils.findOrCreateField)(_objectSpread({
            label: name
          }, schema)), fieldsData) : (0, _utils.findOrCreateField)(_objectSpread({
            label: name
          }, schema));
        })))))
      });
    });
  }, []);
  var removeFieldArray = (0, _react.useCallback)(function (name, index) {
    var except = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
    setStates(function (prev) {
      if (isNaN(index)) {
        delete prev.fields[name];
        return _objectSpread(_objectSpread({}, prev), {}, {
          fields: _objectSpread({}, prev.fields)
        });
      } else {
        return _objectSpread(_objectSpread({}, prev), {}, {
          dirty: true,
          fields: _objectSpread(_objectSpread({}, prev.fields), {}, _defineProperty({}, name, prev.fields[name].filter(function (_, i) {
            return except ? i === index : i !== index;
          })))
        });
      }
    });
  }, []);
  var removeFieldArrays = (0, _react.useCallback)(function (name, indexes) {
    setStates(function (prev) {
      return _objectSpread(_objectSpread({}, prev), {}, {
        dirty: true,
        fields: _objectSpread(_objectSpread({}, prev.fields), {}, _defineProperty({}, name, prev.fields[name].filter(function (_, i) {
          return !indexes.includes(i);
        })))
      });
    });
  }, []);
  var setFieldValues = (0, _react.useCallback)(function (fieldValues) {
    setStates(function (prev) {
      var fields = Object.keys(fieldValues).reduce(function (result, name) {
        var value = fieldValues[name];
        return (0, _utils.validateField)(result, {
          name: name,
          value: value
        });
      }, prev.fields);
      return _objectSpread(_objectSpread({}, prev), {}, {
        dirty: true,
        fields: fields
      });
    });
  }, []);
  var setFieldValue = (0, _react.useCallback)(function (name, value) {
    setStates(function (prev) {
      return _objectSpread(_objectSpread({}, prev), {}, {
        dirty: true,
        fields: (0, _utils.validateField)(prev.fields, {
          name: name,
          value: value
        })
      });
    });
  }, []);
  var setFieldErrors = (0, _react.useCallback)(function (fieldErrors) {
    setStates(function (prev) {
      var fields = Object.keys(fieldErrors).reduce(function (result, name) {
        var message = fieldErrors[name];
        return (0, _utils.validateField)(result, {
          name: name
        }, message);
      }, prev.fields);
      return _objectSpread(_objectSpread({}, prev), {}, {
        fields: fields
      });
    });
  }, []);
  var setFieldError = (0, _react.useCallback)(function (name, message) {
    setStates(function (prev) {
      return _objectSpread(_objectSpread({}, prev), {}, {
        fields: (0, _utils.validateField)(prev.fields, {
          name: name
        }, message)
      });
    });
  }, []);
  var clearFieldErrors = (0, _react.useCallback)(function (names) {
    setStates(function (prev) {
      var fields = names.reduce(function (result, name) {
        return (0, _utils.validateField)(result, {
          name: name
        }, null);
      }, prev.fields);
      return _objectSpread(_objectSpread({}, prev), {}, {
        fields: fields
      });
    });
  }, []);
  var clearFieldError = (0, _react.useCallback)(function (name) {
    setStates(function (prev) {
      return _objectSpread(_objectSpread({}, prev), {}, {
        fields: (0, _utils.validateField)(prev.fields, {
          name: name
        }, null)
      });
    });
  }, []);
  var setDirty = (0, _react.useCallback)(function (dirty) {
    setStates(function (prev) {
      return _objectSpread(_objectSpread({}, prev), {}, {
        dirty: dirty
      });
    });
  }, []);

  var _resetForm = (0, _react.useCallback)(function () {
    setStates(function (prev) {
      return _objectSpread(_objectSpread({}, prev), {}, {
        submitted: false,
        dirty: false,
        fields: (0, _utils.resetFields)(prev.fields)
      });
    });
  }, []);

  var formSubmit = function formSubmit(onSubmit) {
    return function (event) {
      if (event && event.preventDefault) event.preventDefault();
      var target = event && event.target;
      var updatedFieldStates = (0, _utils.validateAllFields)(fields, (0, _utils.transformFieldsToJSON)(fields));
      setStates(function (prev) {
        return _objectSpread(_objectSpread({}, prev), {}, {
          submitted: true,
          fields: updatedFieldStates
        });
      });
      var formevent = new _FormEvent.FormEvent({
        target: target,
        fieldStates: (0, _utils.immutableFields)(updatedFieldStates),
        resetForm: function resetForm() {
          _resetForm();

          if (target && 'document' in window && target.reset) target.reset();
        },
        originalEvent: event,
        setFieldArray: setFieldArray,
        removeFieldArray: removeFieldArray,
        setFieldError: setFieldError,
        setFieldValue: setFieldValue,
        clearFieldError: clearFieldError,
        setFieldArrays: setFieldArrays,
        removeFieldArrays: removeFieldArrays,
        setFieldErrors: setFieldErrors,
        setFieldValues: setFieldValues,
        clearFieldErrors: clearFieldErrors,
        setDirty: setDirty
      });
      typeof onSubmit === 'function' && onSubmit(formevent);
    };
  };

  var formRegistry = (0, _react.useCallback)(function (_ref2) {
    var name = _ref2.name,
        label = _ref2.label,
        rules = _ref2.rules,
        value = _ref2.value,
        _ref2$defaultValue = _ref2.defaultValue,
        defaultValue = _ref2$defaultValue === void 0 ? '' : _ref2$defaultValue;
    var field = (0, _utils.findOrCreateField)({
      label: label || name,
      rules: rules,
      value: typeof value === 'undefined' ? defaultValue : value,
      defaultValue: defaultValue
    });
    setStates(function (prev) {
      var fieldsData = (0, _utils.transformFieldsToJSON)(prev.fields);
      return _objectSpread(_objectSpread({}, prev), {}, {
        fields: _objectSpread(_objectSpread({}, prev.fields), {}, _defineProperty({}, name, prev.submitted ? (0, _utils.validateAndMutateField)(field, fieldsData) : field))
      });
    });
    return function () {
      setStates(function (prev) {
        delete prev.fields[name];
        return _objectSpread(_objectSpread({}, prev), {}, {
          fields: _objectSpread({}, prev.fields)
        });
      });
    };
  }, []);

  var fieldIsRegistered = function fieldIsRegistered(name) {
    return name in fields;
  };

  return {
    submitted: submitted,
    dirty: dirty,
    fields: fields,
    formState: formState,
    formUpdate: formUpdate,
    getValue: getValue,
    formSubmit: formSubmit,
    formRegistry: formRegistry,
    getFieldArray: getFieldArray,
    setFieldArray: setFieldArray,
    setFieldArrays: setFieldArrays,
    removeFieldArray: removeFieldArray,
    removeFieldArrays: removeFieldArrays,
    setFieldValue: setFieldValue,
    setFieldValues: setFieldValues,
    setFieldError: setFieldError,
    setFieldErrors: setFieldErrors,
    clearFieldError: clearFieldError,
    clearFieldErrors: clearFieldErrors,
    setDirty: setDirty,
    resetForm: _resetForm,
    fieldIsRegistered: fieldIsRegistered
  };
};

exports.useForm = useForm;