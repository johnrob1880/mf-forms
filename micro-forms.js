import {
  LitElement,
  html
} from "https://unpkg.com/lit-element/lit-element.js?module";

import { field } from "./inputs.js";
import { isEmpty } from "./rules/index.js";

import Bus from "./bus.js";

const defaultClasses = {
  form: "mf-form",
  framed: "mf-form--framed",
  description: "mf-form-description",
  fields: "mf-fields",
  field: "mf-field",
  hint: "mf-field-hint",
  actions: "mf-form-actions",
  submit: "mf-submit-button",
  cancel: "mf-cancel-button",
  radiolist: "mf-radiolist",
  checklist: "mf-checklist",
  section: "mf-section",
  error: "mf-error"
};

class MicroForm extends LitElement {
  static get properties() {
    return {
      scope: { type: String },
      locale: { type: String },
      def: { type: String }
    };
  }
  constructor() {
    super();
    this.locale = "en";
    this.def = "{}";
    this.__submit = this.__submit.bind(this);
    this.__change = this.__change.bind(this);
    this.__cancel = this.__cancel.bind(this);
    this.__emitEvent = this.__emitEvent.bind(this);
    this.__setErrors = this.__setErrors.bind(this);
    this.__renderField = this.__renderField.bind(this);
    this.validating = this.validating.bind(this);
    this.submitting = this.submitting.bind(this);
    this.changing = this.changing.bind(this);
    this.rendering = this.rendering.bind(this);
    this.translating = this.translating.bind(this);    
    this.formId = "";
    this.bus = new Bus();
  }
  createRenderRoot() {
    return this;
  }
  connectedCallback() {
    super.connectedCallback();
    let scope = this.scope || this.getAttribute("scope");
    if (!scope || scope === "undefined") {
      scope = "";
    }
    let evt = `${scope ? scope + "-" : ""}mf-connected`;
    const api = {
      submitting: this.submitting,
      validating: this.validating,
      changing: this.changing,
      rendering: this.rendering,
      translating: this.translating
    };
    if (evt !== "mf-connected") {
      this.__emitEvent(evt, {
        scope: scope,
        el: this,
        api
      });
    }
    this.__emitEvent("mf-connected", {
      scope: scope,
      el: this,
      api
    });
  }
  submitting(fn) {
    this.bus.addFilter("submitting", fn);
  }
  validating(fn) {
    this.bus.addFilter("validating", fn);
  }
  changing(fn) {
    this.bus.addFilter("changing", fn);
  }
  rendering(fn) {
    this.bus.addFilter("rendering", fn);
  }
  translating(type, fn) {
    this.bus.addFilter(`${type}-translating`, fn);
  }
  render() {
    this.def = this.getAttribute("def")
      ? JSON.parse(this.getAttribute("def"))
      : {};
    if (isEmpty(this.def)) {
      return "";
    }
    if (!this.data) {
      const setData = (c, p) => {
        if (c.hasOwnProperty("value")) {
          p[c.name] = c.value;
        }
        if (c.hasOwnProperty("selected")) {
          p[c.name] = c.selected;
        }
      };
      this.data = this.def.fields.reduce((prev, current) => {
        if (current.type === "section") {
          current.children.forEach(child => {
            setData(child, prev);
          });
        } else {
          setData(current, prev);
        }

        return prev;
      }, {});
    }

    const {
      id,
      title,
      description,
      fields,
      cancelText = "Cancel",
      cancel = true,
      submitText = "Submit",
      classNames,
      framed = false
    } = this.def;
    if (id) {
      this.formId = id;
    }

    this.clss = Object.assign({}, defaultClasses, classNames);

    const actionTranslations = this.bus.applyFilters("actions-translating", {submitText, cancelText}) || {};
    const titleTranslations = this.bus.applyFilters("title-translating", {title, description}) || {};

    return html`
      <form
        class="${this.clss["form"]}${framed ? ` ${this.clss["framed"]}` : ""}"
        id="${id}"
        @submit=${this.__submit}
      >
        ${title
          ? html`
              <legend>${titleTranslations.title || title}</legend>
            `
          : ""}
        ${description
          ? html`
              <p class="${this.clss["description"]}">${titleTranslations.description || description}</p>
            `
          : ""}
        <div class="${this.clss["fields"]}">
          ${fields.map(f => {
            let fld = Object.assign({}, f);
            let translation = this.bus.applyFilters("field-translating", f);
            if (translation) {
              const { label, hint, placeholder} = translation;
              fld.label = label || f.label;
              fld.hint = hint || f.hint || ''
              fld.placeholder = placeholder || f.placeholder || ''
            }
            return this.__renderField(
              fld,
              field({ ...fld, onChange: this.__change, clss: this.clss })
            );
          })}
        </div>
        <div class="${this.clss["actions"]}">
          <button type="submit" class="${this.clss["submit"]}">
            ${actionTranslations.submitText || submitText}
          </button>
          ${cancel
            ? html`
                <button class="${this.clss["cancel"]}" @click=${this.__cancel}>
                  ${actionTranslations.cancelText || cancelText}
                </button>
              `
            : ""}
        </div>
      </form>
    `;
  }
  __renderField(field, el) {
    let x = this.bus.applyFilters("rendering", { field, el }) || {};
    const { before = "", after = "", el: elem = el } = x;

    const isFunc = obj => obj && typeof obj === "function";

    return [
      isFunc(before) ? before(html) : before,
      isFunc(elem) ? elem(html) : elem,
      isFunc(after) ? after(html) : after
    ];
  }
  __change(e) {
    let error = "";
    const { name, value, type } = e.target;
    let oldValue = this.data[name];

    if (type === "checkbox") {
      let options = [].slice.call(
        this.querySelectorAll(`input[name='${name}']:checked`),
        0
      );
      let values = options
        .reduce((prev, next) => {
          prev.push(next.value);
          return prev;
        }, [])
        .join(", ");
      this.bus.applyFilters(
        "changing",
        { name, oldValue, newValue: values },
        this.data
      );
      this.data[name] = values;

      error = this.bus.applyFilters("validating", { name, values });
      error = this.bus.applyFilters("validate-translating", error) || error;
      this.__setErrors({ [name]: isEmpty(error) ? "" : error });
    } else {
      this.bus.applyFilters(
        "changing",
        { name, oldValue, newValue: value },
        this.data
      );
      this.data[name] = value;

      error = this.bus.applyFilters("validating", { name, value });
      error = this.bus.applyFilters("validate-translating", error) || error;
      this.__setErrors({ [name]: isEmpty(error) ? "" : error });
    }
  }
  __cancel(e) {
    e.preventDefault();
    let scope = this.getAttribute("scope");

    const api = {
      reset: () => {
        document.getElementById(this.formId).reset();
        this.data = {};
      }
    };

    this.__emitEvent(`${scope + "-" || ""}mf-cancel`, {
      scope,
      id: this.formId,
      api
    });
    this.__emitEvent("mf-cancel", { scope, id: this.formId, api });
  }
  __setErrors(errors) {
    const { error = "mf-error" } = this.clss || {};
    Object.keys(errors || {}).forEach(key => {
      let $errorMsg = this.querySelector(`[data-error-message="${key}"]`);
      let $field = this.querySelector(`[data-field="${key}"]`);
      if ($errorMsg) {
        $errorMsg.innerText = errors[key];
        if (errors[key] === "") {
          $field.classList.remove(error);
        } else {
          $field.classList.add(error);
        }
      }
    });
  }
  __submit(e) {
    e.preventDefault();
    let scope = this.scope || this.getAttribute("scope");
    let evt = `${scope + "-" || ""}mf-submit`;

    delete this.data["errors"];

    const payload = this.bus.applyFilters("submitting", this.data);

    if (Object.keys(payload.errors || {}).length) {
      this.__setErrors(payload.errors);
      return;
    }
    let eventData = Object.assign({}, payload || this.data);
    if (evt !== "mf-submit") {
      this.__emitEvent(evt, {
        scope,
        data: eventData
      });
    }
    this.__emitEvent("mf-submit", { scope, data: eventData });
  }
  __emitEvent(name, detail) {
    this.dispatchEvent(new CustomEvent(name, { detail, bubbles: true }));
  }
}

customElements.define("micro-form", MicroForm);
