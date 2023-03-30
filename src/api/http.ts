import axios from 'axios'
import { ElMessageBox }  from 'element-plus'
import router from '../router/index'
import tools from '../views/utils/tools'

interface IError {
  code: Number,
  msg: String,
  data: Object
}

const errorFlag:boolean = false

declare module 'axios' {
  interface AxiosResponse<T = any, D = any> {
    code: number,
    data: T,
    msg: string
  }
}


// create an axios instance
const http = axios.create({
  baseURL: import.meta.env.VITE_APP_BASE_API, // url = base url + request url
  // withCredentials: true, // send cookies when cross-domain requests
  validateStatus: (status:Number) => {
    return status >= 200 && status <= 500 // 修改axios返回的状态码
  },
  timeout: 600000 // request timeout
})

// HTTP请求拦截
http.interceptors.request.use(config => {
  const isToken = (config.headers || {}).isToken === false
  const token = tools.getStore('token')
  if (token && !isToken) {
    config.headers['token'] = token// token
  }
  return config
}, error => {
  console.log(error)
  Promise.reject(error)
})

// 响应拦截器
http.interceptors.response.use((res) => {
  const status = Number(res.status) || 200
  const message = res.data.msg
  const code = res.data.code
  if (code!=undefined) {
    if (code === 0) {
      return res.data
    } else {
      return Promise.reject(res.data)
    }
  } else {
    return res.data
  }
}, (error:IError) => {
  console.log('err是什么', error)
})

export default http
