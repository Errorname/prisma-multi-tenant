"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const defaultOptions = {
    instanciate: () => ({}),
    nameStageFromReq: (req) => req.headers['prisma-service'].split('/')
};
exports.default = defaultOptions;
