"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.FormEvent = void 0;

var _utils = require("./utils");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var FormEvent = /*#__PURE__*/function () {
  function FormEvent(props) {
    _classCallCheck(this, FormEvent);

    Object.assign(this, props);
  }

  _createClass(FormEvent, [{
    key: "locateFailed",
    value: function locateFailed() {
      var _this = this;

      var correction = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 40;
      var autoscroll = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
      var scrollableElement = (0, _utils.getClosestScrolled)(this.target || document.documentElement);
      var scrolledTop = scrollableElement.scrollTop;
      var lowestErrorTop = Object.keys(this.fieldStates).reduce(function (result, current) {
        if (!_this.fieldStates[current].isInvalid) return result;

        var error = _this.target.querySelector("[name=\"".concat(current, "\"]"));

        var currentTop = scrollableElement.scrollTop + (error && error.getBoundingClientRect().top || 0);
        return result ? Math.min(currentTop, result) : currentTop;
      }, null);
      if (lowestErrorTop === scrolledTop) return scrolledTop;
      return autoscroll ? scrollableElement.scrollTo({
        top: lowestErrorTop - correction,
        left: 0,
        behavior: 'smooth'
      }) : lowestErrorTop - correction;
    }
  }, {
    key: "erroredFieldStates",
    value: function erroredFieldStates() {
      var fieldStates = (0, _utils.immutableFields)(this.fieldStates);
      return Object.keys(fieldStates).filter(function (key) {
        return fieldStates[key].isInvalid;
      }).reduce(function (result, key) {
        result[key] = fieldStates[key];
        return result;
      }, {});
    }
  }, {
    key: "isReady",
    value: function isReady() {
      return (0, _utils.computeFieldWhenReady)(this.fieldStates);
    }
  }, {
    key: "forEach",
    value: function forEach(callback) {
      var form = this.json();
      Object.keys(form).forEach(function (field) {
        return callback(form[field].value, field);
      });
    }
  }, {
    key: "json",
    value: function json() {
      return (0, _utils.transformFieldsToJSON)(this.fieldStates);
    }
  }, {
    key: "paramArray",
    value: function paramArray() {
      var result = [];
      this.forEach(function (value, name) {
        return result.push({
          name: name,
          value: value
        });
      });
      return result;
    }
  }, {
    key: "param",
    value: function param() {
      return this.paramArray().reduce(function (result, current) {
        return result += Array.isArray(current.value) ? current.value.reduce(function (res, val) {
          return res += "&".concat(current.name, "=").concat(val);
        }, '') : "&".concat(current.name, "=").concat(current.value);
      }, '').substr(1);
    }
  }, {
    key: "formData",
    value: function formData() {
      return new FormData(this.target);
    }
  }]);

  return FormEvent;
}();

exports.FormEvent = FormEvent;