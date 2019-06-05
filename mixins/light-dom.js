

export const LightDomMixin = (base) => class LightDomMixin extends base {
    constructor() {
        super();
    }
    createRenderRoot() {
        return this;
    }
}