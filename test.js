const {API}=require('./index.js')
const rootConfig={
  _header:{
    test:true
  }
}

const api = API({
  base_url:'https://api.wanfang.gov.tw/api/',
  root:rootConfig
})

;(async ()=>{
  const authInfo=await api.auth.login({
    id:'99356',pw:'99356.test',sys:'test'
  })
  console.log('authInfo',authInfo)

  //dynamic  config
  console.log('authed request', await api.auth.info({},{_header:{'x-wfauth':authInfo.jwt_token}}))
  console.log('unAuthed request', await api.auth.info())
  
  //root config
  rootConfig['_header']['x-wfauth']=authInfo.jwt_token
  console.log('??? request', await api.auth.info())
})()
