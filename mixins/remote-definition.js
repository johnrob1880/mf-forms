import { html } from "https://unpkg.com/lit-element/lit-element.js?module";

export const RemoteDefinitionMixin = url => base =>
  class RemoteDefinition extends base {
    constructor() {
      super();
      this.url = url;
    }
    connectedCallback() {
      super.connectedCallback();

      let url = this.url || this.getAttribute("url") || this.dataset["url"];

      if (!url) {
        return;
      }

      fetch(url)
        .then(res => res.json())
        .then(data => {
            
          const { validations = {}, messages = {}, ...definition } = data || {};
          this.validations = validations;
          this.messages = Object.assign({}, this.messages, messages);
          this.definition = definition;
          let mf = this.querySelector('micro-form');
          mf.setAttribute('scope', this.scope || 'remote');
          mf.setAttribute('def', JSON.stringify(this.definition));

        })
        .catch(err => {
            this.error = true;
            console.log('remote error', err);
        });
    }
    render() {
      return html`
        ${this.error
          ? ""
          : html`
              <micro-form
                locale=${this.locale}
                scope=${this.scope}
              ></micro-form>
            `}
      `;
    }
  };
