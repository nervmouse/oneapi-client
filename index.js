const axios =require('axios')
const {mergeDeep} =require('./lib/deep_merge.js')
let storageInstance=localStorage
function setStorage(storage=localStorage){
  storageInstance=storage
}
function saveToken(token,root){
  if (storageInstance){
    storageInstance.setItem('oneapi-jwt',token)
  }
  if (!root._header){
    root._header={}
  }
  root._header['x-wfauth']=token
}
function clearToken(root){
  //localStorage.setItem('oneapi-jwt',token)
  if (storageInstance){
    storageInstance.removeItem('oneapi-jwt')
  }
  delete root._header['x-wfauth']
}
function getURIToken(name='login_token'){
  try{
    let qs = new URLSearchParams(window.location.search)
    return qs.get(name)
  }catch(e){

  }
  
}
let hookAuth={
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
        saveToken(auth.jwt_token,root)
      }else{
        clearToken(root)
      }
      return auth
    }
  },
  'auth.check':{
    onBefore(params={},store,self,root){
      if(!params.token){
        let auth_token =getURIToken('auth_token')
        if (auth_token){
          params.token=auth_token
        }else{
          if (storageInstance){
            params.token=storageInstance.getItem('oneapi-jwt')
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
function API({base_url='',pa=[],joinner='.',hook={},api_cache={},store={},root={},object=function(){},isRoot=true}){
  let api_path=pa.join(joinner)
  if (api_cache[api_path]){
    return api_cache[api_path]
  }else{
    if (!object.children){
      object.children={}
      if(isRoot){
        object.children._header={
          
        }
      }
    }

    
    let api=new Proxy(object,{
      get:function(target,prop,self){
          //console.log(target,this)
          if (target.children[prop]){
            return target.children[prop]
          }else{
            return target.children[prop]=API({base_url,pa:pa.concat(prop),joinner,hook,api_cache,store,root:(root || self),isRoot:false})
          }
          
      },
      enumerate:function(target){
        return Object.keys(target.children)[Symbol.iterator]()
      },
      apply:async function(target, self, args){
        let url=base_url+api_path
        let hk=hook[api_path]
        
        let params=args[0] || {}
        let tmp_cfg=args[1]
        let cfg=mergeDeep({},root)
        if (tmp_cfg){
          
          cfg=mergeDeep(cfg,tmp_cfg)
          
        }
        
        if (hk && hk.onBefore){
          res=await hk.onBefore(params,store,self,cfg)
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
          res=await hk.onAfter(res,params,store,self,cfg)
        }
        return res
      }
    })
    api_cache[api_path]=api
    return api
  }
  
}
module.exports= {API,hookAuth,setStorage}
