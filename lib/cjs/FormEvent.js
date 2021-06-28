import { transformFieldsToJSON, computeFieldWhenReady, getClosestScrolled } from './utils';
export class FormEvent {
  constructor(props) {
    Object.assign(this, props);
  }

  locateFailed(correction = 40, autoscroll = true) {
    const scrollableElement = getClosestScrolled(this.target || document.documentElement);
    const scrolledTop = scrollableElement.scrollTop;
    const lowestErrorTop = Object.keys(this.fieldStates).reduce((result, current) => {
      if (!this.fieldStates[current].isInvalid) return result;
      const error = this.target.querySelector(`[name="${current}"]`);
      const currentTop = scrollableElement.scrollTop + (error && error.getBoundingClientRect().top || 0);
      return result ? Math.min(currentTop, result) : currentTop;
    }, null);
    if (lowestErrorTop === scrolledTop) return scrolledTop;
    return autoscroll ? scrollableElement.scrollTo({
      top: lowestErrorTop - correction,
      left: 0,
      behavior: 'smooth'
    }) : lowestErrorTop - correction;
  }

  isReady() {
    return computeFieldWhenReady(this.fieldStates);
  }

  forEach(callback) {
    const form = this.json();
    Object.keys(form).forEach(field => callback(form[field].value, field));
  }

  json() {
    return transformFieldsToJSON(this.fieldStates);
  }

  paramArray() {
    const result = [];
    this.forEach((value, name) => result.push({
      name,
      value
    }));
    return result;
  }

  param() {
    return this.paramArray().reduce((result, current) => result += Array.isArray(current.value) ? current.value.reduce((res, val) => res += `&${current.name}=${val}`, '') : `&${current.name}=${current.value}`, '').substr(1);
  }

  formData() {
    return new FormData(this.target);
  }

}