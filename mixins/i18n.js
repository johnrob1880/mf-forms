export const i18nMixin = base =>
  class i18nMixin extends base {
    constructor() {
      super();    
      this.locale = 'en';
    }
    connectedCallback() {
      super.connectedCallback();

      let scope = this.getAttribute('scope') || this.scope;      

      if (!scope || Object.keys(this.translations).length === 0) {
        return;
      }

      window.addEventListener(`${scope}-mf-connected`, e => {
        const { api } = e.detail;

        api.translating('field', ({name, label, hint, placeholder}) => {
          return {
              label: this.translate(`${name}:label`) || this.translate(label),
              hint: this.translate(`${name}:hint`) || this.translate(hint),
              placeholder: this.translate(`${name}:placeholder`) || this.translate(placeholder)
          } 
        });
        api.translating('actions', ({submitText, cancelText}) => {
          return {
              submitText: this.translate(`actions:submit`) || this.translate(submitText),
              cancelText: this.translate(`actions:cancel`) || this.translate(cancelText)
          }
        })
        api.translating('title', ({title, description}) => {
              return {
                  title: this.translate(`form:title`) || this.translate(title),
                  description: this.translate(`form:description`) || this.translate(description)
              }
        });
      })

    }
    translate(text) {
        let locale = this.getAttribute('locale') || this.locale;
        if (!this.translations[locale] || !this.translations[this.locale][text]) {
          return null;
        }
        return this.translations[this.locale][text];
    }
  };
