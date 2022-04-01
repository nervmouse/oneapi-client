"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.API = exports.hookAuth = exports.getURIToken = exports.clearToken = exports.saveToken = exports.setStorage = exports.APIConfig = void 0;
const lodash_1 = require("lodash");
const axios_1 = require("axios");
class APIConfig {
    constructor() {
        this.base_url = '/api/';
        this.pa = [];
        this.joinner = '.';
        this.hook = {};
        this.api_cache = {};
        this.store = {};
        this.root = {};
        this.object = (() => { });
        this.isRoot = true;
        this._header = {};
    }
}
exports.APIConfig = APIConfig;
const memStorage = {
    data: {},
    setItem(key, val) {
        if (this.data) {
            this.data[key] = val;
        }
    },
    removeItem(key) {
        if (this.data) {
            delete this.data[key];
        }
    },
    getItem(key) {
        if (this.data) {
            return this.data[key];
        }
    }
};
let storageInstance;
try {
    storageInstance = localStorage;
}
catch (e) {
    storageInstance = memStorage;
}
function setStorage(storage) {
    storageInstance = storage;
}
exports.setStorage = setStorage;
function saveToken(token, root) {
    if (storageInstance) {
        storageInstance.setItem('oneapi-jwt', token);
    }
    if (!root._header) {
        root._header = {};
    }
    root._header['x-wfauth'] = token;
}
exports.saveToken = saveToken;
function clearToken(root) {
    //localStorage.setItem('oneapi-jwt',token)
    if (storageInstance) {
        storageInstance.removeItem('oneapi-jwt');
    }
    if (root._header) {
        delete root._header['x-wfauth'];
    }
}
exports.clearToken = clearToken;
function getURIToken(name = 'login_token') {
    try {
        let qs = new URLSearchParams(window.location.search);
        return qs.get(name);
    }
    catch (e) {
    }
}
exports.getURIToken = getURIToken;
exports.hookAuth = {
    'auth.login': {
        onBefore(params = {}, store, self, root, sessionStore) {
            if (!params.id) {
                let login_token = getURIToken('login_token');
                if (login_token) {
                    params.login_token = login_token;
                    params.sys_token = login_token;
                }
                else {
                    let auth_token = storageInstance.getItem('oneapi-jwt');
                    if (auth_token) {
                        params.auth_token = auth_token;
                        if (sessionStore) {
                            sessionStore.auth_token = auth_token; //store token 
                        }
                    }
                }
            }
        },
        onAfter(auth, params, store, self, root) {
            if (auth.auth) {
                if (typeof auth.jwt_token === 'string') {
                    saveToken(auth.jwt_token, root);
                }
            }
            else {
                clearToken(root);
            }
            return auth;
        }
    },
    'auth.check': {
        onBefore(params = {}, store, self, root) {
            if (!params.token) {
                let auth_token = getURIToken('auth_token');
                if (auth_token) {
                    params.token = auth_token;
                }
                else {
                    if (storageInstance) {
                        params.token = storageInstance.getItem('oneapi-jwt');
                    }
                }
            }
        },
        onAfter(auth, params, store, self, root) {
            if (!auth.auth) {
                clearToken(root);
            }
            return auth;
        }
    }
};
//const api_cache:{[key :string]:IAPISourceObject}={}
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
const API = function ({ base_url = '/api/', pa = [], joinner = '.', hook = {}, _header = {}, object = (() => { }), api_cache = {}, store = {}, isRoot = true, root = {} }) {
    //const {object,pa ,joinner,isRoot,base_url,hook,root,store,api_cache} = config
    let api_path = pa.join(joinner);
    if (api_cache && api_cache[api_path]) {
        return api_cache[api_path];
    }
    else {
        if (object && !object.children) {
            object.children = { _header: {} };
            //object.children._header={} as IHeader
        }
    }
    const api = new Proxy((object), {
        get: function (target = {}, prop, self) {
            //console.log(target,this)
            if (target && target.children) {
                if (target.children[prop]) {
                    return target.children[prop];
                }
                else {
                    const newTarget = (() => { });
                    const newPa = [...pa];
                    if (prop) {
                        newPa.push(prop);
                    }
                    return target.children[prop] = (0, exports.API)({
                        base_url,
                        pa: newPa,
                        object: newTarget,
                        joinner,
                        hook,
                        api_cache,
                        store,
                        root: (root || self),
                        isRoot: false
                    });
                }
            }
        },
        apply: function (target, self, args) {
            return __awaiter(this, void 0, void 0, function* () {
                let url = base_url + api_path;
                let hk;
                if (hook) {
                    hk = hook[api_path];
                }
                let params = args[0] || {};
                let tmp_cfg = args[1];
                let cfgRoot = root;
                let cfg = (0, lodash_1.merge)({}, cfgRoot);
                if (tmp_cfg) {
                    cfg = (0, lodash_1.merge)(cfg, tmp_cfg);
                }
                let res;
                if (hk && hk.onBefore) {
                    res = yield hk.onBefore(params, store || {}, self, cfg);
                    if (res)
                        return res;
                }
                //res= (await axios.post(url,params)).data
                res = (yield (0, axios_1.default)({
                    method: 'post',
                    url,
                    headers: cfg._header,
                    data: params
                })).data;
                if (hk && hk.onAfter) {
                    res = yield hk.onAfter(res, params, store || {}, self, root);
                }
                return res;
            });
        }
    });
    if (api_cache) {
        api_cache[api_path] = api;
    }
    return api;
};
exports.API = API;
