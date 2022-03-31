export interface IPlainObject {
    [key: string]: IPlainObject | string | number | boolean | IPlainObject[];
}
export interface IPlainConfig extends IPlainObject {
}
export interface IHeader extends IPlainObject {
}
export interface IAPISourceObject {
    (): IPlainObject | Array<IPlainObject>;
    [key: string]: IAPISourceObject | IHeader;
}
export interface IHook {
    onBefore?: (params: IPlainConfig, store: Object, self: IPlainObject, cfg: APIConfig, storage?: IPlainObject) => any;
    onAfter?: (res: IPlainObject, params: IPlainConfig, store: IPlainObject, self: Object, root: APIConfig) => any;
}
export interface IHookSet {
    [key: string]: IHook;
}
export interface IAPIConfig {
    base_url?: string;
    pa?: Array<string>;
    joinner?: string;
    hook?: IHookSet;
    api_cache?: IPlainObject;
    store?: IPlainObject;
    root?: Object;
    object?: IAPISourceObject;
    isRoot?: boolean;
    _header?: IHeader;
}
export declare class APIConfig implements IAPIConfig {
    base_url: string;
    pa: string[];
    joinner: string;
    hook: IHookSet;
    api_cache: {};
    store: {};
    root: IAPISourceObject;
    object: IAPISourceObject;
    isRoot: boolean;
    _header: IHeader;
}
export interface IStorage {
    data?: {
        [key: string]: string;
    };
    setItem(key: string, val: string): void;
    getItem(key: string): string | null | undefined;
    removeItem(key: string): void;
}
export declare function setStorage(storage: IStorage): void;
export declare function saveToken(token: string, root: APIConfig): void;
export declare function clearToken(root: APIConfig): void;
export declare function getURIToken(name?: string): string | null | undefined;
export declare const hookAuth: IHookSet;
export declare const API: (config: APIConfig) => IAPISourceObject;
