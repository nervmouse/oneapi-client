export interface IPlainObject {
    [key: string]: IPlainObject | string | number | boolean | IPlainObject[];
}
export declare type IPlainConfig = IPlainObject;
export declare type IHeader = IPlainObject;
export interface IAPIFunction {
    (params?: any): any;
}
export interface IAPISourceObject extends IAPIFunction {
    children?: {
        _header: IHeader;
        [key: string]: IAPI | IHeader;
    };
    [key: string]: IAPISourceObject | IHeader | undefined;
}
export interface IAPI extends IAPIFunction {
    [key: string]: IAPI;
}
export declare type IHookFunctionAfter = (res: IPlainObject, params: IPlainConfig, store: IPlainObject, self: Record<string, any>, root: IAPISourceObject, storage?: IPlainObject) => any;
export declare type IHookFunctionBefore = (params: IPlainConfig, store: Record<string, any>, self: IPlainObject, cfg: APIConfig, storage?: IPlainObject) => any;
export interface IHook {
    onBefore?: IHookFunctionBefore;
    onAfter?: IHookFunctionAfter;
}
export interface IHookSet {
    [key: string]: IHook;
}
export interface IAPIConfig {
    base_url?: string;
    pa?: Array<string>;
    joinner?: string;
    hook?: IHookSet;
    api_cache?: {
        [key: string]: IAPI;
    };
    store?: IPlainObject;
    root?: Record<string, any>;
    object?: IAPISourceObject;
    isRoot?: boolean;
    _header?: IHeader;
}
export declare class APIConfig implements IAPIConfig {
    base_url?: string | undefined;
    pa: string[];
    joinner: string;
    hook: IHookSet;
    api_cache?: {
        [key: string]: IAPI;
    };
    store?: {} | undefined;
    root?: IAPISourceObject | undefined;
    object?: IAPISourceObject | undefined;
    isRoot?: boolean | undefined;
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
export declare function saveToken(token: string, root: IAPISourceObject): void;
export declare function clearToken(root: IAPISourceObject): void;
export declare function getURIToken(name?: string): string | null | undefined;
export declare const hookAuth: IHookSet;
/**
 * export const API=function(config:APIConfig={
  base_url:'/api/',
  pa:[],
  joinner:'.',
  hook:{},
  _header:{},
  object:(()=>{}) as IAPI,
  api_cache:{},
  store:{},
  isRoot:true



}):IAPI{
 *
 */
export declare const API: ({ base_url, pa, joinner, hook, _header, object, api_cache, store, isRoot, root }: {
    base_url?: string | undefined;
    pa?: string[] | undefined;
    joinner?: string | undefined;
    hook?: IHookSet | undefined;
    _header?: {} | undefined;
    object?: IAPISourceObject | undefined;
    api_cache?: {
        [key: string]: IAPI;
    } | undefined;
    store?: {} | undefined;
    isRoot?: boolean | undefined;
    root?: IAPISourceObject | undefined;
}) => IAPI;
