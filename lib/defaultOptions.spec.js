"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const defaultOptions_1 = require("./defaultOptions");
describe('defaultOptions', () => {
    it('instanciate should return empty object', () => {
        const instanciated = defaultOptions_1.default.instanciate('default', 'default');
        expect(instanciated).toEqual({});
    });
    it('nameStageFromReq should extract name/stage from "prisma-service" header', () => {
        const req = { headers: { 'prisma-service': 'default/prod' } };
        const [name, stage] = defaultOptions_1.default.nameStageFromReq(req);
        expect(name).toEqual('default');
        expect(stage).toEqual('prod');
    });
});
