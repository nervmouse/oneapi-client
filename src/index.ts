import {merge} from 'lodash'
import axios from 'axios'
export interface IPlainObject{
  [key:string]:IPlainObject | string | number | boolean | IPlainObject[]
}
export interface IPlainConfig extends IPlainObject{
}
export interface IHeader extends IPlainObject {
}
export interface IAPIFunction{
  (params?:any):any
}
export interface IAPISourceObject extends IAPIFunction   {
  children?:{
    _header:IHeader
    [key:string]:IAPI | IHeader
  }
  [key:string]:IAPISourceObject | IHeader  | undefined
  
}
export interface IAPI extends IAPIFunction{
  [key:string]:IAPI
}
export interface IHook{
  
  onBefore?:(params:IPlainConfig,store:Object,self:IPlainObject,cfg:APIConfig,storage?:IPlainObject)=>any
  onAfter?:(res:IPlainObject,params:IPlainConfig,store:IPlainObject,self:Object,root:IAPISourceObject)=>any
}
export interface IHookSet{
  [key:string]:IHook
}
export interface IAPIConfig {
  base_url?:string
  pa?:Array<string>
  joinner?:string
  hook?:IHookSet
  api_cache?:{[key:string]:IAPI}
  store?:IPlainObject
  root?:Object
  object?:IAPISourceObject
  isRoot?:boolean
  _header?:IHeader
}

export class APIConfig implements IAPIConfig{
  base_url?='/api/'
  pa:string[]=[]
  joinner='.'
  hook:IHookSet={}
  api_cache?:{[key:string]:IAPI}={}
  store?={}
  root?={} as IAPISourceObject
  object?=(()=>{}) as IAPISourceObject
  isRoot?=true
  _header:IHeader={} 
}

export interface IStorage {
  data?:{
    [key:string]:string
  }
  setItem(key:string,val:string):void
  getItem(key:string):string | null | undefined
  removeItem(key:string):void

}

const memStorage:IStorage={
  data:{},
  setItem(key,val){
    if (this.data){
      this.data[key]=val  
    }
    
  },
  removeItem(key){
    if (this.data){
      delete this.data[key]
    }
  },
  getItem(key) {
    if (this.data){
      return this.data[key]
    }
  }
}
let storageInstance:IStorage

try{
  storageInstance=localStorage
}catch(e){
  storageInstance = memStorage
}
export function setStorage(storage:IStorage){
  storageInstance=storage
}
export function saveToken(token:string,root:IAPISourceObject){
  if (storageInstance){
    storageInstance.setItem('oneapi-jwt',token)
  }
  if (!root._header){
    root._header={}  as IHeader
  }
  root._header['x-wfauth']=token
}
export function clearToken(root:IAPISourceObject){
  //localStorage.setItem('oneapi-jwt',token)
  if (storageInstance){
    storageInstance.removeItem('oneapi-jwt')
  }
  if (root._header){
    delete root._header['x-wfauth']
  }
  
}
export function getURIToken(name='login_token'){
  try{
    let qs = new URLSearchParams(window.location.search)
    return qs.get(name)
  }catch(e){

  }
  
}
export const hookAuth:IHookSet={
  'auth.login':{
    onBefore(params={},store,self,root,sessionStore){
      if(!params.id){
        
        let login_token = getURIToken('login_token')
        
        if (login_token){
          params.login_token=login_token
          params.sys_token=login_token
        }else{
          let auth_token=storageInstance.getItem('oneapi-jwt')
          if(auth_token){
            params.auth_token=auth_token
            if (sessionStore){
              sessionStore.auth_token=auth_token //store token 
            }
            
          }
        }
        
      }
      
    },
    onAfter(auth,params,store,self,root){
      if (auth.auth){
        if (typeof auth.jwt_token === 'string'){
          saveToken(auth.jwt_token,root)
        }
        
      }else{
        clearToken(root)
      }
      return auth
    }
  } as IHook,
  'auth.check':{
    onBefore(params={},store,self,root){
      if(!params.token){
        let auth_token =getURIToken('auth_token')
        if (auth_token){
          params.token=auth_token
        }else{
          if (storageInstance){
            params.token=storageInstance.getItem('oneapi-jwt') as string
          }
        }
      }
      
    },
    onAfter(auth,params,store,self,root){
      if (!auth.auth){
        
        clearToken(root)
      }
      return auth
    }
  }
  
}
interface ProxyHandler{
  enumerate(target:IAPISourceObject):any[]
}
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
export const API=function({
  base_url='/api/',
  pa=[] as string[],
  joinner='.',
  hook={} as IHookSet,
  _header={},
  object=(()=>{}) as IAPISourceObject,
  api_cache={} as {[key:string]:IAPI},
  store={},
  isRoot=true,
  root={} as IAPISourceObject
}):IAPI{
  //const {object,pa ,joinner,isRoot,base_url,hook,root,store,api_cache} = config
  let api_path:string=pa.join(joinner)
  if (api_cache && api_cache[api_path]){
    return api_cache[api_path]
  }else{
    if (object &&!object.children){
        object.children={_header:{}} 
        //object.children._header={} as IHeader
      }
    }
    const api=new Proxy((object),{
        get:function(target={} as IAPISourceObject,prop:string,self){
            //console.log(target,this)
            if (target && target.children){
              if ( target.children[prop] ){
                return target.children[prop]
              }else{
                const newTarget =( ()=>{} )as IAPISourceObject
                const newPa:string[]=[...pa]
                if (prop){
                  newPa.push(prop )
                }
                
                  return target.children[prop]=API({
                    base_url,
                    pa:newPa,
                    object:newTarget,
                    joinner,
                    hook,
                    api_cache,
                    store,
                    root:(root || self),
                    isRoot:false} as APIConfig
                  )
                
                
              }
            }

            
        },/*
        enumerate:function(target:IAPISourceObject){
          
          return Object.keys(target.children)[Symbol.iterator]()
          
          
        },*/
        apply:async function(target, self, args){
          let url=base_url+api_path
          
          let hk
          if (hook ){
            
            hk=hook[api_path]
          }
          
          
          let params=args[0] || {}
          let tmp_cfg=args[1]
          let cfgRoot=root as unknown
          let cfg=merge({},cfgRoot) as APIConfig
          if (tmp_cfg){
            
            cfg=merge(cfg,tmp_cfg)
            
          }
          let res
          if (hk && hk.onBefore){
            res=await hk.onBefore(params,store || {},self,cfg)
            if (res) return res
          }
          //res= (await axios.post(url,params)).data
          
          res= (await axios({
            method:'post',
            url,
            headers:cfg._header,
            data:params
          })).data
          if (hk && hk.onAfter){
            res=await hk.onAfter(res,params,store || {},self,root)
          }
          return res
        }
    } ) as IAPI
    if (api_cache){
      api_cache[api_path]=api
    }
    
    return api
  }
  

