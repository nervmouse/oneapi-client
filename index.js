const axios =require('axios')
const {mergeDeep} =require('./lib/deep_merge.js')

function saveToken(token,root){
  if (localStorage){
    localStorage.setItem('oneapi-jwt',token)
  }
  root._header['x-wfauth']=token
}
function clearToken(root){
  //localStorage.setItem('oneapi-jwt',token)
  if (localStorage){
    localStorage.removeItem('oneapi-jwt')
  }
  delete root._header['x-wfauth']
}
let hookAuth={
  'auth.login':{
    
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
        if (localStorage){
          params.token=localStorage.getItem('oneapi-jwt')
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
module.exports= {API,hookAuth}
