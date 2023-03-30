import http from './http'

// 登录接口
const login = (params:object) => {
  return http.request({
    url: `/openapi/user/login`,
    method: 'post',
    data: params
  })
}

// 查询个人信息
const getUserInfo = (token:string|null) => {
  return http.request({
    url: `/openapi/user/info`,
    headers: {
      isToken: token ? true : false
    },
    method: 'post',
    data: {
      token: ''
    }
  })
}

export default {
  login,
  getUserInfo
}