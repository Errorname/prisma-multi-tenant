"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const MultiTenant_1 = require("./MultiTenant");
const defaultOptions_1 = require("./defaultOptions");
describe('MultiTenant', () => {
    it('should have default options', () => {
        const multiTenant = new MultiTenant_1.default();
        expect(multiTenant.options).toEqual(defaultOptions_1.default);
    });
    it('should override default options', () => {
        const options = {
            instanciate: () => ({ test: true }),
            nameStageFromReq: () => ['default', 'prod']
        };
        const multiTenant = new MultiTenant_1.default(options);
        expect(multiTenant.options).toEqual(options);
    });
    it('should instanciate', () => {
        const multiTenant = new MultiTenant_1.default();
        const instance = multiTenant.instanciate('default', 'default');
        expect(instance).not.toBeNull();
    });
    it('should retrieve an instanciated Prisma', () => {
        const multiTenant = new MultiTenant_1.default();
        const instance = multiTenant.instanciate('default', 'default');
        const retrieved = multiTenant.getInstance('default', 'default');
        expect(retrieved).toBe(instance);
    });
    it("shouldn't retrieve an non-instanciated Prisma", () => {
        const multiTenant = new MultiTenant_1.default();
        const instance = multiTenant.getInstance('default', 'default');
        expect(instance).toBeNull();
    });
    it('should return the current instance based on the request', () => {
        const req = { headers: { 'prisma-service': 'default/default' } };
        const multiTenant = new MultiTenant_1.default();
        const instance = multiTenant.instanciate('default', 'default');
        const current = multiTenant.current(req);
        expect(current).toBe(instance);
    });
    it('should instanciate the current instance based on the request', () => {
        const req = { headers: { 'prisma-service': 'default/default' } };
        const multiTenant = new MultiTenant_1.default();
        const current = multiTenant.current(req);
        expect(current).not.toBeNull();
        expect(current._meta).toEqual({ service: { name: 'default', stage: 'default' } });
    });
});
