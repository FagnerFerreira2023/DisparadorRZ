import { type PoolClient } from 'pg';
export declare function query<T = any>(text: string, params?: any[]): Promise<T[]>;
export declare function getClient(): Promise<PoolClient>;
export declare function transaction<T>(callback: (client: PoolClient) => Promise<T>): Promise<T>;
export declare function closePool(): Promise<void>;
declare const _default: {
    query: typeof query;
    getClient: typeof getClient;
    transaction: typeof transaction;
    closePool: typeof closePool;
};
export default _default;
//# sourceMappingURL=connection.d.ts.map