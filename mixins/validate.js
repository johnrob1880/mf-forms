import { isNumber, isInteger, isEmpty, isDate, isArray, isEmail, isFunction } from '../rules/index.js';

const explodeRules = rules => {
    return Object.keys(rules).reduce((prev, current) => {
        prev[current] = { rules: []};
        let rule = rules[current];
        if (typeof rule === 'string') {
            rule.split('|').forEach(item => {
                if (item.indexOf(':') !== -1) {
                    // has options
                    let opts = item.split(':');
                    prev[current].rules.push({ rule: opts[0], arg: opts[1]})
                } else {
                    prev[current].rules.push({ rule: item });
                }
            })
        }
        return prev;
    }, {});
}

const validators = {
    'required': ({value}) => !isEmpty(value),
    'min': ({value, min}) => isNumber(value) && value >= min,
    'max': ({value, max}) => isNumber(value) && value <= max,
    'number': ({value}) => isNumber(value),
    'integer': ({value}) => isInteger(value),
    'date': ({value}) => isDate(value),
    'email': ({value}) => isEmail(value)
}

export const ValidateMixin = (base) => class ValidateMixin extends base {

    constructor() {
        super();
        this.validations = {};
        this.messages = {
            'required': ({name}) => `${name} is required.`,
            'min': ({name, min}) => `${name} must be greater than ${min}.`,
            'max': ({name, max}) => `${name} must be less than ${max}.`,
            'number': ({name}) => `${name} must be a valid number.`,
            'date': ({name}) => `${name} must be a valid date.`,
            'integer': ({name}) => `${name} must be a valid integer.`,
            'email': ({name}) => `${name} must be a valid email.`
        };
        this.validate = this.validate.bind(this);
    }

    connectedCallback() {
        super.connectedCallback();

        if (!this.scope) {
            console.log('Warning - scope is not set. Bypassing validation!');
            return;
        }

        let key = `${this.scope}-mf-connected`;

        window.addEventListener(key, e => {
            const { api } = e.detail;

            api.submitting(values => {
                if (isEmpty(this.validations)) {
                    return values;
                }
                let errors = this.validate(values, this.validations);
                if (!isEmpty(errors)) {
                    values.errors = Object.assign({}, values.errors, errors);
                }
                return values;
            });
            api.validating(({name, value}) => {
                if (isEmpty(this.validations)) {
                    return;
                }
                let validator = this.validations[name];
                if (validator) {                    
                    let errors = this.validate({[name]: value}, {[name]: validator});
                    
                    if (!isEmpty(errors)) {
                        return isArray(errors[name]) ? errors[name].join(" ") : errors[name];
                    }
                }
                return '';
            });
        })
    }
    validate(data, rules) {

        if (!rules) {
            return {};
        }
        if (!data) {
            data = {}
        }
        
        const exploded = explodeRules(rules);

        const getName = name => {
            if (this.definition) {
                let field = (typeof this.definition === 'string' 
                    ? JSON.parse(this.definition) 
                    : this.definition).fields.filter(n => n.name === name)[0];
                return field ? (field.label || name) : name;
            }
            return name;
        }

        const getMessage = (name, rule, args) => {
            let key = `${rule}:${name}`;

            // translations
            if (this.translations && this.translations[this.locale]) {
                let msg = this.translations[this.locale][key];
                if (!isEmpty(msg)) {
                    return msg;
                }
            }
            
            if (this.messages[key]) {
                return isFunction(this.messages[key]) ? 
                    this.messages[key](args) : 
                    this.messages[key];
            } else {
                return isFunction(this.messages[rule]) ? this.messages[rule](args) : this.messages[rule]
            }
        }

        let errors = Object.keys(exploded).reduce((prev, current) => {
            (exploded[current].rules || []).forEach(rule => {
                let val = data[current];
                if (validators[rule.rule]) {
                    let args = {value: val, name: getName(current), [rule.rule]: rule.arg};
                    if (!validators[rule.rule](args)) {
                        prev[current] = prev[current] || [];
                        let msg = getMessage(current, rule.rule, args);
                        if (msg) {
                            prev[current].push(msg);
                        }                       
                    }
                }
            })

            return prev;
        }, {});

        return errors;
    }
}