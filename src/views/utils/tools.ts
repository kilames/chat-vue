const getStore = (name:string) => {
  const val = window.localStorage.getItem(name)
  return val
}

const setStore = (name:string, value:string) => {
  window.localStorage.setItem(name, value)
}

const removeStore = (name:string) => {
  window.localStorage.removeItem(name)
}

export default {
  getStore,
  setStore,
  removeStore
}