export interface MultiTenantOptions {
    instanciate: (name: string, stage: string) => PrismaInstance;
    nameStageFromReq: (req: Object) => [string, string];
}
export interface PrismaInstances {
    [name: string]: {
        [stage: string]: PrismaInstance;
    };
}
export interface PrismaInstance extends Object {
    _meta?: {
        service: {
            name: string;
            stage: string;
        };
    };
}
