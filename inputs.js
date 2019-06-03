import { html } from "https://unpkg.com/lit-element/lit-element.js?module";

const inputDate = val => {
    var local = new Date(val);
    local.setMinutes(local.getMinutes() - local.getTimezoneOffset());
    let json = local.toJSON();
    return json ? json.slice(0, 10) : null;
}

export const fieldLabel = ({name, label}) => html`<label for="${name}">${label}</label>`
export const textInput = ({name, id, placeholder = '', value = '', required, onChange}) => html`<input name=${name} ?id=${id} type="text" placeholder=${placeholder} .value="${value}" .required=${required} @change=${onChange} />`
export const numberInput = ({name, id, value = '', onChange, required, step = 1, min, max}) => 
    html`<input @change=${onChange} name=${name} ?id=${id} type="number" ?required=${required} step=${step} ?min=${min} ?max=${max} value="${value}" />`;

export const dateInput = ({name, id, value = '', onChange, required}) => 
    html`<input @change=${onChange} name=${name} ?id=${id} type="date" ?required=${required} value="${value ? inputDate(value) : ''}" />`;

export const selectInput = ({name, id, options = [], selected, onChange}) => 
    html`<select name="${name}" ?id=${id} @change=${onChange}>
        ${options.map(opt => 
            html`<option value="${opt.value}" ?selected=${selected === opt.value ? true : false}>${opt.text}</option>`)}
    </select>`

export const textArea = ({name, id, value = '', placeholder = '', required, onChange, rows = 5}) =>
html`<textarea rows=${rows} @change=${onChange} name=${name} placeholder=${placeholder} ?id=${id} ?required=${required}>${value}</textarea>`;


export const checkList = ({name, label, options = [], selected, onChange, clss, inline = true}) => 
    html`<div data-field="${name}" class="${clss['field']} ${clss['checklist']} ${inline ? clss['checklist'] + '--inline' : ''}">
        ${label ? html`<label class="${clss['checklist']}-label" for="${name}">${label}</label>` : ''}
        <div class="${clss['checklist']}-options">
            ${options.map(opt => html`<label class="${clss['checklist']}-option"><input type="checkbox" name="${name}" @change=${onChange} ?checked=${selected === (opt.value ? opt.value : opt) } value="${opt.value || opt}" />${opt.text || opt}</label>`)}
        </div>
        <p data-error-message="${name}"></p>
    </div>`

export const radioList = ({name, label, options = [], selected, onChange, clss, inline = true}) => 
    html`<div data-field="${name}" class="${clss['field']} ${clss['radiolist']} ${inline ? clss['radiolist'] + '--inline' : ''}">
        ${label ? html`<label class="${clss['radiolist']}-label" for="${name}">${label}</label>` : ''}
        <div class="${clss['radiolist']}-options">
            ${options.map(opt => html`<label class="${clss['radiolist']}-option"><input type="radio" name="${name}" @change=${onChange} ?checked=${selected === (opt.value ? opt.value : opt) } value="${opt.value || opt}" />${opt.text || opt}</label>`)}
        </div>
        <p data-error-message="${name}"></p>
    </div>`

const map = {
    'text': textInput,
    'number': numberInput,
    'date': dateInput,
    'select': selectInput,
    'textarea': textArea,
    'radiolist': radioList,
    'checklist': checkList
}

export const field = obj => {
    const { label, name, type, hint, clss } = obj;
    
    if (['radiolist', 'checklist'].indexOf(type) !== -1) {
        return map[type](obj);
    }

    return html`
        <div class="${clss['field']}" data-field="${name}">
            ${label ? fieldLabel({name, label}) : ''}
            ${map[type] ? map[type](obj) : map['text'](obj) }
            ${hint ? html`<p class="${clss['hint']}">${hint}</p>` : ''}
            <p data-error-message="${name}">${field.error || ''}</p>
        </div>
    `
}
