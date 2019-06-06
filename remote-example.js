import {
  LitElement,
  html
} from "https://unpkg.com/lit-element/lit-element.js?module";

import {
  ComposableMixin,
  ValidateMixin,
  LightDomMixin,
  RemoteDefinitionMixin,
  i18nMixin
} from "./mixins/index.js?module";

class RemoteForm extends ComposableMixin(LitElement).compose(
  LightDomMixin,
  ValidateMixin,
  i18nMixin,
  RemoteDefinitionMixin("/definitions/login.json")
) {
  static get properties() {
    return {
      title: { type: String },
      scope: { type: String },
      locale: { type: String }
    };
  }
  constructor() {
      super();
      this.scope = 'remote';
      this.locale = 'en';
      this.translations = {
        es: {
          'username:label': 'nombre de usuario',
          'password:label': 'contraseña',
          'action:submit': 'iniciar sesión',
          'form:description': 'Utilice el siguiente formulario para iniciar sesión en su cuenta',
          'actions:submit': 'Enviar',
          'actions:cancel': 'Cancelar',
          'locale:label': 'Idioma',
          'required:username': 'se requiere el primer nombre',
          'required:password': 'se requiere contraseña'
        }
      }
  }
  connectedCallback() {
      super.connectedCallback();

      window.addEventListener('remote-mf-connected', e => {
          const { api } = e.detail;
          // Handle the translation switching
          api.changing(({name, newValue}) => {
            if (name === 'locale') {
                this.locale = newValue;
                this.querySelector('micro-form').setAttribute('locale', newValue);
            }            
          });
      })

  }
}

customElements.define("mf-remote-form", RemoteForm);
