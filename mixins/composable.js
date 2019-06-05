export const ComposableMixin = base => class Composable extends base {
    static compose(...mixins) {
        return mixins.reduce(composeClass, this);
    }
}

const NON_MIXABLE_OBJECT_PROPERTIES = [
    'constructor'
];

function composeClass(base, mixin) {
    if (typeof mixin === 'function') {
        return mixin(base);
    } else {
        class Subclass extends base {};
        copyOwnProperties(mixin, Subclass.prototype, NON_MIXABLE_OBJECT_PROPERTIES);
    }
}

function copyOwnProperties(source, target, ignorePropertyNames = []) {
    Object.getOwnPropertyNames(source).forEach(name => {
        if (ignorePropertyNames.indexOf(name) < 0) {
            const descriptor = Object.getOwnPropertyDescriptor(source, name);
            Object.defineProperty(target, name, descriptor);
        }
    });
    return target;
}