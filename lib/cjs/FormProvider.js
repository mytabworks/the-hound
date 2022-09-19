"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _react = _interopRequireDefault(require("react"));

var _FormHooks = require("./FormHooks");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var FormProvider = function FormProvider(_ref) {
  var value = _ref.value,
      children = _ref.children;
  return /*#__PURE__*/_react["default"].createElement(_FormHooks.FormContext.Provider, {
    value: value
  }, children);
};

var _default = FormProvider;
exports["default"] = _default;