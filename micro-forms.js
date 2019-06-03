import {
  LitElement,
  html
} from "https://unpkg.com/lit-element/lit-element.js?module";

import { field } from "./inputs.js";
import Bus from "./bus.js";

const defaultClasses = {
  form: "mf-form",
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
      def: { type: String }
    };
  }
  constructor() {
    super();
    this.def = "{}";
    this.__submit = this.__submit.bind(this);
    this.__change = this.__change.bind(this);
    this.__cancel = this.__cancel.bind(this);
    this.__emitEvent = this.__emitEvent.bind(this);
    this.__setErrors = this.__setErrors.bind(this);
    this.validating = this.validating.bind(this);
    this.submitting = this.submitting.bind(this);
    this.changing = this.changing.bind(this);

    this.formId = "";
    this.bus = new Bus();
  }
  createRenderRoot() {
    return this;
  }
  connectedCallback() {
    super.connectedCallback();
    let scope = this.getAttribute("scope");
    let evt = `${scope + "-" || ""}mf-connected`;
    const api = {
      submitting: this.submitting,
      validating: this.validating,
      changing: this.changing
    }
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
  render() {
    this.def = JSON.parse(this.getAttribute("def") || "{fields: []}") || {};
    if (!this.data) {
      const setData = (c, p) => {
        if (c.hasOwnProperty("value")) {
          p[c.name] = c.value;
        }
        if (c.hasOwnProperty("selected")) {
          p[c.name] = c.selected;
        }
      }
      this.data = this.def.fields.reduce((prev, current) => {
        if (current.type === 'section') {
          current.children.forEach(child => {
            setData(child, prev);
          })
        } else {
          setData(current, prev);
        }
        
        return prev;
      }, {});
    }

    const {
      id,
      title,
      fields,
      cancelText = "Cancel",
      cancel = true,
      submitText = "Submit",
      classNames
    } = this.def;
    if (id) {
      this.formId = id;
    }

    this.clss = Object.assign({}, defaultClasses, classNames);

    return html`
      <form class="${this.clss["form"]}" id="${id}" @submit=${this.__submit}>
        ${title
          ? html`
              <legend>${title}</legend>
            `
          : ""}
        ${fields.map(f =>
          field({ ...f, onChange: this.__change, clss: this.clss })
        )}
        <div class="${this.clss["actions"]}">
          <button class="${this.clss["submit"]}" @click=${this.__submit}>
            ${submitText}
          </button>
          ${cancel
            ? html`
                <button class="${this.clss["cancel"]}" @click=${this.__cancel}>
                  ${cancelText}
                </button>
              `
            : ""}
        </div>
      </form>
    `;
  }
  __change(e) {
    const { name, value, type } = e.target;  
    let oldValue = this.data[name];  
    if (type === "checkbox") {
      let options = [].slice.call(
        document.querySelectorAll(`input[name='${name}']:checked`),
        0
      );
      let values = options
        .reduce((prev, next) => {
          prev.push(next.value);
          return prev;
        }, [])
        .join(", ");
      this.data[name] = values;
    } else {
      
      this.bus.applyFilters("changing", { name, oldValue, newValue: value }, this.data);

      this.data[name] = value;
    }

    const error = this.bus.applyFilters("validating", { name, value: {} });    
    this.__setErrors({ [name]: error || "" });
    
  }
  __cancel(e) {
    e.preventDefault();
    let scope = this.getAttribute("scope");

    this.__emitEvent(`${scope + "-" || ""}mf-cancel`, {
      scope,
      id: this.formId
    });
    this.__emitEvent("mf-cancel", { scope, id: this.formId });
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
    let scope = this.getAttribute("scope");
    let evt = `${scope + "-" || ""}mf-submit`;
    let form = this.querySelectorAll('form')[0];

    delete this.data["errors"];

    const payload = this.bus.applyFilters("submitting", this.data);

    if (Object.keys(payload.errors || {}).length) {
      // show errors?
      this.__setErrors(payload.errors);
      return;
    }
    if (payload) {
      delete payload['errors'];
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
