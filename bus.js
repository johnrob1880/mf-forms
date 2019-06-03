
class Bus {
    constructor(actions, filters) {
        this.hooks = {
            actions: actions || {},
            filters: filters || {}
        };
    }
    addAction(tag, callback, priority) {
        if (typeof priority === 'undefined') {
            priority = 10;
        }
        this.hooks.actions[tag] = this.hooks.actions[tag] || [];
        this.hooks.actions[tag].push({priority: priority, callback: callback});
    }
    addFilter(tag, callback, priority) {
        if (typeof priority === 'undefined') {
            priority = 10;
        }
        this.hooks.filters[tag] = this.hooks.filters[tag] || [];
        this.hooks.filters[tag].push({priority: priority, callback: callback});
    }
    removeAction(tag, callback) {
        this.hooks.actions[tag] = this.hooks.actions[tag] || [];
        this.hooks.actions[tag].forEach((action, i) => {
            if (action.callback === callback) {
                this.hooks.actions[tag].splice(i, 1);
            }
        })
    }
    removeFilter(tag, callback) {
        this.hooks.filters[tag] = this.hooks.filters[tag] || [];
        this.hooks.filters[tag].forEach((action, i) => {
            if (action.callback === callback) {
                this.hooks.filters[tag].splice(i, 1);
            }
        })
    }
    runAction(tag, options) {
        var actions = [];
        if (typeof this.hooks.actions[tag] !== 'undefined' && this.hooks.actions[tag].length > 0) {
            this.hooks.actions[tag].forEach(hook => {
                actions[hook.priority] = actions[hook.priority] || [];
                actions[hook.priority].push(hook.callback);
            });
            actions.forEach(hooks => {
                hooks.forEach(callback => {
                    callback(options);
                })
            });
        }
    }
    applyFilters(tag, value, options) {
        var filters = [];

        if (typeof this.hooks.filters[tag] !== 'undefined' && this.hooks.filters[tag].length > 0) {
            this.hooks.filters[tag].forEach(hook => {
                filters[hook.priority] = filters[hook.priority] || [];
                filters[hook.priority].push(hook.callback);
            });

            filters.forEach(hooks => {
                hooks.forEach( callback => {
                    value = callback(value, options);
                });
            });
        }
        return value;
    }
}

export default Bus;