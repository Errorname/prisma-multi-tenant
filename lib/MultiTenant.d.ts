import { MultiTenantOptions, PrismaInstances, PrismaInstance } from './types';
declare class MultiTenant {
    options: MultiTenantOptions;
    instances: PrismaInstances;
    constructor(options?: MultiTenantOptions);
    current(req: Object): PrismaInstance;
    getInstance(name: string, stage: string): PrismaInstance | null;
    instanciate(name: string, stage: string): PrismaInstance;
}
export default MultiTenant;
