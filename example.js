import {
    LitElement,
    html
  } from "https://unpkg.com/lit-element/lit-element.js?module";

import { ComposableMixin } from './mixins/composable.js';
import { ValidateMixin } from './mixins/validate.js';
import { LightDomMixin } from './mixins/light-dom.js';

class ExampleComponent extends ComposableMixin(LitElement).compose(
    LightDomMixin,
    ValidateMixin
) {
    static get properties() {
        return {
          title: { type: String },
          scope: { type: String }
        };
      }
    constructor() {
        super();
        this.title = "Example Form";
        this.scope = "example";
        this.validations = {
            firstname: 'required',
            lastname: 'required',
            email: 'required|email'
        };   
    }
    connectedCallback() {
        super.connectedCallback();

        this.definition = JSON.stringify({
            title: this.title,
            id: 'exampleForm',
            fields: [
                { name: 'firstname', label: 'Firstname' },
                { name: 'lastname', label: 'Lastname' },
                { name: 'email', label: 'Email', type: 'email' }
            ]
        });

        window.addEventListener('mf-cancel', function (e) {
            console.log('cancel', e.detail);
            e.detail.api.reset();
        });
    }
    render() {
        return html`
            <micro-form def=${this.definition} scope=${this.scope}></micro-form>
        `;
    }   

}

customElements.define('mf-example-form', ExampleComponent);