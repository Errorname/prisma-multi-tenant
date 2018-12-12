"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const defaultOptions_1 = require("./defaultOptions");
class MultiTenant {
    constructor(options = defaultOptions_1.default) {
        this.options = Object.assign({}, defaultOptions_1.default, options);
        this.instances = {};
    }
    current(req) {
        const [name, stage] = this.options.nameStageFromReq(req);
        if (!name || !stage) {
            throw Error('The service name/stage could not be found in the request');
        }
        if (!this.getInstance(name, stage))
            this.instanciate(name, stage);
        return this.getInstance(name, stage);
    }
    getInstance(name, stage) {
        return this.instances[name] ? this.instances[name][stage] : null;
    }
    instanciate(name, stage) {
        const instance = this.options.instanciate(name, stage);
        instance._meta = {
            service: {
                name,
                stage
            }
        };
        if (!this.instances[name])
            this.instances[name] = {};
        this.instances[name][stage] = instance;
        return instance;
    }
}
exports.default = MultiTenant;
