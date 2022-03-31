

export interface APIClinetInstance {
  (): Object | Array<Object> 
  [key:string]:APIClinetInstance
}
export interface IAPIConfig {
  base_url:string
  pa:string[]
  joinner:string
  hook:Object
  api_cache:Object
  store:Object
  root:Object
  object:()=>void
  isRoot:boolean
}

export class APIConfig implements IAPIConfig{
  base_url='/api/'
  pa:string[]
  joinner:string='.'
  hook:{}
  api_cache:{}
  store:{}
  root:{}
  object:()=>void
  isRoot=true
}
export interface API {
  (config:APIConfig):APIClinetInstance
}
export default interface APIModule{
  API
}