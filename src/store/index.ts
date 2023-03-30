import { defineStore } from 'pinia'

// 用户信息保存store
export const user = defineStore('userInfo', {
  state: () => {
    return {
      userInfo: {}
    }
  },
  actions: {
    // 这里要改成对应接口的类型
    setUserInfo(userInfo:any) {
      this.userInfo = userInfo
    }
  }
})